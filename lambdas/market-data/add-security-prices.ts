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
import pg from 'pg';

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

let pgClient: IDatabase<any>;
let pgp: IMain;

const runLambda = async () => {
    console.log("Starting")
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
            console.log("Processing Close Price")
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
    console.log("Finished")
}

const processClosePrice = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getUsExchangeListedSecuritiesWithPricing();
    const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);
    const updateEod: updateSecurityPrice[] = [];
    const insertEod: addSecurityPrice[] = [];
    const dt = DateTime.now().setZone("America/New_York").set({minute: 0, hour: 16, second: 0, millisecond: 0});

    for (let i = 0; i < securityGroups.length; i++) {
        const securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);

        try {
            const response = await iex.bulk(symbols, ["ohlc"])
            for (let j = 0; j < securityGroup.length; j++) {
                const sec = securityGroup[j];
                let eodPrice = {
                    price: sec.isEodPrice ? sec.isEodPrice : sec.latestPrice,
                    low: sec.isEodLow,
                    high: sec.isEodHigh,
                    open: sec.isEodOpen,
                    isEod: true,
                    isIntraday: false,
                    securityId: sec.id,
                    time: dt.toJSDate(),
                }

                if (response[sec.symbol] === undefined || response[sec.symbol] === null) {
                    if (sec.isEodId === null && eodPrice.price !== null) insertEod.push({
                        price: eodPrice.price,
                        low: eodPrice.low,
                        high: eodPrice.high,
                        time: eodPrice.time,
                        open: eodPrice.open,
                        securityId: eodPrice.securityId,
                        isEod: true,
                        isIntraday: false,
                    });
                    else if (sec.isEodId !== null && eodPrice.price !== null) {
                        updateEod.push({
                            id: sec.isEodId,
                            price: eodPrice.price,
                            low: eodPrice.low,
                            high: eodPrice.high,
                            open: eodPrice.open,
                            isEod: true,
                            isIntraday: false,
                            securityId: sec.id,
                            time: eodPrice.time,
                        })
                    }

                    console.error(`could not find quote for symbol ${sec.symbol}`);
                    continue
                }

                const ohlc = (response[sec.symbol]['ohlc'] as GetOHLC)
                let close = ohlc.close?.price,
                    open = ohlc.open?.price,
                    high = ohlc.high,
                    low = ohlc.low;

                let curEodPrice = eodPrice.price;
                if (close === null) {
                    if (curEodPrice === null) continue
                    close = curEodPrice;
                    open = curEodPrice;
                    high = curEodPrice;
                    low = curEodPrice;
                }

                if (sec.isEodId === null && curEodPrice !== null) {
                    insertEod.push({
                        price: curEodPrice,
                        low: low,
                        high: high,
                        open: open,
                        isEod: true,
                        isIntraday: false,
                        time: dt.toJSDate(),
                        securityId: sec.id
                    });
                }

                if (sec.isEodId !== null && curEodPrice !== null) updateEod.push({
                    id: sec.isEodId,
                    price: curEodPrice,
                    low: low,
                    high: high,
                    open: open,
                    isEod: true,
                    isIntraday: false,
                    time: dt.toJSDate(),
                    securityId: sec.id
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
    console.log("Total Securities: ", securities.length);
    const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);
    console.log("Total Security Groups: ", securityGroups.length)

    let securitiesPrices: addSecurityPrice[] = [],
        newEodPrices: addSecurityPrice[] = [],
        oldEodPrices: updateSecurityPrice[] = [];

    for (let i = 0; i < securityGroups.length; i++) {
        const securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);

        try {
            const response = await iex.bulk(symbols, ["intraday-prices"], {
                chartIEXOnly: true,
                chartIEXWhenNull: true
            });

            const {prices, eodInsert, eodUpdate} = await perform(securityGroup, response)
            securitiesPrices = [...securitiesPrices, ...prices];
            newEodPrices = [...newEodPrices, ...eodInsert];
            oldEodPrices = [...oldEodPrices, ...eodUpdate];
        } catch (err) {
            console.error(err)
            console.error(symbols.join(", "))
        }
    }

    try {
        await repository.upsertSecuritiesPrices(securitiesPrices);
    } catch (e) {
        console.error("could not upsert security prices.... ", e)
    }

    try {
        await repository.insertSecuritiesPrices(newEodPrices);
    } catch (e) {
        console.error("could not insert security prices ", e)
    }

    try {
        await repository.updatePricesById(oldEodPrices)
    } catch (e) {
        console.error("could not update security prices ", e)
    }
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

    const today930 = DateTime.now().setZone("America/New_York").set({hour: 9, minute: 30, second: 0, millisecond: 0});
    for (let i = 0; i < securityGroup.length; i++) {
        const sec = securityGroup[i];
        let eodPrice = {
            id: sec.isEodId,
            securityId: sec.id,
            price: sec.isEodPrice ? sec.isEodPrice : sec.latestPrice,
            time: today930,
            open: sec.isEodOpen ? sec.isEodOpen : sec.latestPrice,
            high: sec.isEodHigh ? sec.isEodHigh : sec.latestPrice,
            low: sec.isEodLow ? sec.isEodLow : sec.latestPrice,
            isIntraday: false,
            isEod: true
        }

        if (response[sec.symbol] === undefined || response[sec.symbol] === null) {
            if (eodPrice.id === null && eodPrice.price !== null) eodInsert.push({
                price: eodPrice.price,
                securityId: eodPrice.securityId,
                open: eodPrice.open,
                time: eodPrice.time.toJSDate(),
                high: eodPrice.high,
                low: eodPrice.low,
                isEod: true,
                isIntraday: false,
            })
            else if (eodPrice.price === null) console.log("EOD PRICE IS NULL -- WE GOT NOTHING FOR SECURITY: ", sec.symbol)
            continue
        }

        const intradayPrices = (response[sec.symbol]['intraday-prices'] as GetIntraDayPrices[])
        if (intradayPrices.length <= 0) {
            if (eodPrice.id === null && eodPrice.price !== null) eodInsert.push({
                price: eodPrice.price,
                securityId: eodPrice.securityId,
                open: eodPrice.open,
                time: eodPrice.time.toJSDate(),
                high: eodPrice.high,
                low: eodPrice.low,
                isEod: true,
                isIntraday: false,
            })
            else if (eodPrice.price === null) console.log("WE GOT NOTHING FOR SECURITY: ", sec.symbol)
            continue
        }

        const mostRecentPriceAvail = intradayPrices[intradayPrices.length - 1];
        const mostRecentPriceTimeAvail = DateTime.fromFormat(`${mostRecentPriceAvail.date} ${mostRecentPriceAvail.minute}`, "yyyy-LL-dd HH:mm", {
            zone: "America/New_York"
        });

        eodPrice.time = mostRecentPriceTimeAvail

        if (sec.latestTime !== null && mostRecentPriceTimeAvail.toUnixInteger() === sec.latestTime.toUnixInteger()) continue

        let latestPrice = sec.latestPrice;

        for (let j = 0; j < intradayPrices.length; j++) {
            const ip = intradayPrices[j];
            const t = DateTime.fromFormat(`${ip.date} ${ip.minute}`, "yyyy-LL-dd HH:mm", {
                zone: "America/New_York"
            });

            if (!t.isValid) continue

            // Ignoring 4:00pm prices for security prices
            if (t.hour === 16) continue

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
            if (eodPrice.open === null && t.hour === 9 && t.minute === 30)
                eodPrice.open = close

            eodPrice.price = close
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
            securityId: sec.id,
            id: eodPrice.id,
        })
    }

    return {prices: securityPrices, eodUpdate, eodInsert}
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};