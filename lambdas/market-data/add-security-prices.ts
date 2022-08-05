import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import Repository from "@tradingpost/common/market-data/repository";
import {
    addSecurityPrice, getSecurityWithLatestPrice
} from '@tradingpost/common/market-data/interfaces';
import IEX, {GetIntraDayPrices, GetQuote} from "@tradingpost/common/iex";
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
            host: postgresConfiguration['host'] as string,
            user: postgresConfiguration['user'] as string,
            password: postgresConfiguration['password'] as string,
            database: postgresConfiguration['database'] as string
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

    try {
        if (currentTime.hour === 16 && currentTime.minute >= 15) {
            await processClosePrice(repository, iex);
            return
        }

        await processIntradayPrices(repository, iex)
    } catch (e) {
        console.error(e)
        throw e
    }
}

const processClosePrice = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getUsExchangeListedSecuritiesWithPricing();
    const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);

    let securityPrices: addSecurityPrice[] = [];
    for (let i = 0; i < securityGroups.length; i++) {
        const securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);

        try {
            const response = await iex.bulk(symbols, ["quote"])

            for (let j = 0; j < securityGroup.length; j++) {
                const sec = securityGroup[j];
                const {symbol, latestPrice, latestHigh, latestLow, latestOpen, latestTime} = sec
                if (response[symbol] === undefined || response[symbol] === null) {
                    console.error(`could not find quote for symbol ${symbol}`);
                    continue
                }

                const quote = (response[symbol]['quote'] as GetQuote)

            }
        } catch (err) {
            console.error(err)
        }
    }

    await repository.upsertSecuritiesPrices(securityPrices)
}

const processIntradayPrices = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getUsExchangeListedSecuritiesWithPricing();
    const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);

    let securityPrices: addSecurityPrice[] = [];
    for (let i = 0; i < securityGroups.length; i++) {
        const securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);

        try {
            const response = await iex.bulk(symbols, ["intraday-prices"]);
            const prices = await perform(securityGroup, response)
            securityPrices = [...securityPrices, ...prices]
        } catch (err) {
            console.error(err)
        }
    }

    await repository.upsertSecuritiesPrices(securityPrices);
}

const perform = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>): Promise<addSecurityPrice[]> => {
    const securityPrices: addSecurityPrice[] = [];
    for (let i = 0; i < securityGroup.length; i++) {
        const sec = securityGroup[i];
        let {symbol, id, latestTime, latestPrice, latestHigh, latestLow, latestOpen} = sec;
        if (response[symbol] === undefined || response[symbol] === null) {
            console.error(`could not find intraday-prices for symbol ${symbol}`);
            continue
        }

        const intradayPrices = (response[symbol]['intraday-prices'] as GetIntraDayPrices[])
        if (intradayPrices.length <= 0) continue

        let mostRecentPriceAvail = intradayPrices[intradayPrices.length - 1];
        const mostRecentPriceTimeAvail = DateTime.fromFormat(`${mostRecentPriceAvail.date} ${mostRecentPriceAvail.minute}`, "yyyy-LL-dd HH:mm", {
            zone: "America/New_York"
        });

        if (mostRecentPriceTimeAvail.toUnixInteger() === latestTime.toUnixInteger()) continue

        for (let j = 0; j < intradayPrices.length; j++) {
            const ip = intradayPrices[j];
            const t = DateTime.fromFormat(`${ip.date} ${ip.minute}`, "yyyy-LL-dd HH:mm", {
                zone: "America/New_York"
            });

            if (t.toUnixInteger() <= mostRecentPriceTimeAvail.toUnixInteger() && t.toUnixInteger() > latestTime.toUnixInteger()) {
                if (ip.close) latestPrice = ip.close
                if (ip.high) latestHigh = ip.high
                if (ip.low) latestLow = ip.low
                if (ip.open) latestOpen = ip.open

                securityPrices.push({
                    price: ip.close ? ip.close : latestPrice,
                    high: ip.high ? ip.high : latestHigh,
                    low: ip.low ? ip.low : latestLow,
                    open: ip.open ? ip.open : latestOpen,
                    securityId: id,
                    time: t.toJSDate()
                })
            }
        }
    }

    return securityPrices
}

module.exports.run = async (event: any, context: Context) => {
    await runLambda();
};