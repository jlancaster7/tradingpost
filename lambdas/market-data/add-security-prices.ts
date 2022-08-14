import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import Repository from "@tradingpost/common/market-data/repository";
import {
    addSecurityPrice,
    getSecurityWithLatestPrice,
    updateSecurityPrice
} from '@tradingpost/common/market-data/interfaces';
import IEX, {GetIntraDayPrices, GetOHLC} from "@tradingpost/common/iex";
import {DateTime} from "luxon";
import MarketTradingHours from "@tradingpost/common/market-data/market-trading-hours";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {buildGroups} from "./utils";

let pgClient: IDatabase<any>;
let pgp: IMain;

const runLambda = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })

        await pgClient.connect();
    }

    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    const repository = new Repository(pgClient, pgp);
    const marketService = new MarketTradingHours(repository);

    const currentTime = DateTime.now().setZone("America/New_York")

    const isTradingDay = await marketService.isTradingDay(currentTime);
    if (!isTradingDay || (currentTime.hour > 16 && currentTime.minute > 30)) return;

    const t930 = DateTime.now().setZone("America/New_York").set({hour: 9, minute: 30, second: 0, millisecond: 0})
    const t400 = DateTime.now().setZone("America/New_York").set({hour: 16, minute: 0, second: 59, millisecond: 999})
    const t415 = DateTime.now().setZone("America/New_York").set({hour: 16, minute: 15, second: 0, millisecond: 0})

    try {
        if (currentTime.set({second: 0, millisecond: 0}).toUnixInteger() == t415.toUnixInteger()) {
            await processClosePrice(repository, iex);
            return
        }

        if (currentTime.toUnixInteger() >= t930.toUnixInteger() && currentTime.toUnixInteger() <= t400.toUnixInteger()) {
            await processIntradayPrices(repository, iex)
        }
    } catch (e) {
        console.error(e)
        throw e
    }
}

const processClosePrice = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getUsExchangeListedSecuritiesWithPricing();
    const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);
    const updateEod: updateSecurityPrice[] = [];
    const insertEod: addSecurityPrice[] = []
    const dt = DateTime.now().setZone("America/New_York").set({minute: 0, hour: 16, second: 0, millisecond: 0});

    for (let i = 0; i < securityGroups.length; i++) {
        const securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);

        try {
            const response = await iex.bulk(symbols, ["ohlc"])
            for (let j = 0; j < securityGroup.length; j++) {
                const sec = securityGroup[j];
                if (response[sec.symbol] === undefined || response[sec.symbol] === null) {
                    console.error(`could not find quote for symbol ${sec.symbol}`);
                    continue
                }

                const ohlc = (response[sec.symbol]['ohlc'] as GetOHLC)
                let close = ohlc.close.price,
                    open = ohlc.open.price,
                    high = ohlc.high,
                    low = ohlc.low;

                let curEodPrice = sec.isEodPrice;
                if (close === null) {
                    if (curEodPrice === null) continue
                    close = curEodPrice;
                    open = curEodPrice;
                    high = curEodPrice;
                    low = curEodPrice;
                }

                let eodPrice: addSecurityPrice = {
                    price: close,
                    low: low,
                    high: high,
                    open: open,
                    isEod: true,
                    isIntraday: false,
                    securityId: sec.id,
                    time: dt.toJSDate(),
                }

                if (sec.isEodId === null) {
                    insertEod.push(eodPrice);
                    continue
                }

                updateEod.push({
                    ...eodPrice,
                    id: sec.isEodId
                })
            }
        } catch
            (err) {
            console.error(err)
        }
    }

    await repository.insertSecuritiesPrices(insertEod);
    await repository.updatePricesById(updateEod);
}

const processIntradayPrices = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getUsExchangeListedSecuritiesWithPricing();
    const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);

    let securityPrices: addSecurityPrice[] = [];
    let eodPricesInsert: addSecurityPrice[] = [];
    let eodPricesUpdate: updateSecurityPrice[] = [];

    for (let i = 0; i < securityGroups.length; i++) {
        const securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);

        try {
            const response = await iex.bulk(symbols, ["intraday-prices"], {
                chartIEXOnly: true,
                chartIEXWhenNull: true
            });

            const {prices, eodInsert, eodUpdate} = await perform(securityGroup, response)
            securityPrices = [...securityPrices, ...prices]
            eodPricesInsert = [...eodPricesInsert, ...eodInsert];
            eodPricesUpdate = [...eodPricesUpdate, ...eodUpdate];
        } catch (err) {
            console.error(err)
        }
    }

    await repository.upsertSecuritiesPrices(securityPrices);
    await repository.insertSecuritiesPrices(eodPricesInsert);
    await repository.updatePricesById(eodPricesUpdate)
}

type PerformResponse = {
    prices: addSecurityPrice[],
    eodInsert: addSecurityPrice[],
    eodUpdate: updateSecurityPrice[]
}

const perform = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>): Promise<PerformResponse> => {
    const securityPrices: addSecurityPrice[] = [];
    const eodInsert: addSecurityPrice[] = []
    const eodUpdate: updateSecurityPrice[] = []

    for (let i = 0; i < securityGroup.length; i++) {
        const sec = securityGroup[i];
        if (response[sec.symbol] === undefined || response[sec.symbol] === null) {
            console.error(`could not find intraday-prices for symbol ${sec.symbol}`);
            continue
        }

        const intradayPrices = (response[sec.symbol]['intraday-prices'] as GetIntraDayPrices[])
        if (intradayPrices.length <= 0) {
            console.error(`no intraday prices available for symbol ${sec.symbol}`)
            continue
        }

        const mostRecentPriceAvail = intradayPrices[intradayPrices.length - 1];
        const mostRecentPriceTimeAvail = DateTime.fromFormat(`${mostRecentPriceAvail.date} ${mostRecentPriceAvail.minute}`, "yyyy-LL-dd HH:mm", {
            zone: "America/New_York"
        });

        if (sec.latestTime !== null && mostRecentPriceTimeAvail.toUnixInteger() === sec.latestTime.toUnixInteger()) continue

        let eodPrice = {
            id: sec.isEodId,
            securityId: sec.id,
            price: sec.isEodPrice,
            time: mostRecentPriceTimeAvail,
            open: sec.isEodOpen,
            high: sec.isEodHigh,
            low: sec.isEodLow,
            isIntraday: false,
            isEod: true
        }

        let latestPrice = sec.latestPrice;

        for (let j = 0; j < intradayPrices.length; j++) {
            const ip = intradayPrices[j];
            const t = DateTime.fromFormat(`${ip.date} ${ip.minute}`, "yyyy-LL-dd HH:mm", {
                zone: "America/New_York"
            });

            if (sec.latestTime !== null && sec.latestTime.toUnixInteger() > t.toUnixInteger()) continue

            let high = ip.high,
                low = ip.low,
                close = ip.close,
                open = ip.open;

            if (high === null) high = latestPrice
            if (low === null) low = latestPrice
            if (close === null) close = latestPrice
            if (open === null) open = latestPrice

            if (close === null) continue

            if ((eodPrice.high === null && ip.high !== null) || (eodPrice.high !== null && ip.high !== null && eodPrice.high < ip.high))
                eodPrice.high = ip.high
            if ((eodPrice.low === null && ip.low !== null) || (eodPrice.low !== null && ip.low !== null && eodPrice.low > ip.low))
                eodPrice.low = ip.low
            if (eodPrice.open === null && ip.open !== null && t.hour === 9 && t.minute === 30)
                eodPrice.open = ip.open

            securityPrices.push({
                price: close,
                securityId: sec.id,
                time: t.toJSDate(),
                open: open,
                low: low,
                high: high,
                isEod: false,
                isIntraday: true
            })
        }

        if (eodPrice.price === null) continue

        eodPrice.id === null ? eodInsert.push({
            price: eodPrice.price,
            isIntraday: false,
            isEod: true,
            high: eodPrice.high,
            low: eodPrice.low,
            open: eodPrice.open,
            time: eodPrice.time.toJSDate(),
            securityId: sec.id,
        }) : eodUpdate.push({
            price: eodPrice.price,
            isIntraday: false,
            isEod: true,
            high: eodPrice.high,
            low: eodPrice.low,
            open: eodPrice.open,
            time: eodPrice.time.toJSDate(),
            securityId: eodPrice.securityId,
            id: eodPrice.id,
        })
    }

    return {prices: securityPrices, eodUpdate, eodInsert}
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};