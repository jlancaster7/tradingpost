import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import Repository from "@tradingpost/common/market-data/repository";
import {
    addSecurityPrice,
    getSecurityBySymbol,
    getSecurityWithLatestPrice
} from '@tradingpost/common/market-data/interfaces';
import IEX, {GetQuote} from "@tradingpost/common/iex";
import {DateTime} from "luxon";
import MarketTradingHours from "@tradingpost/common/market-data/market-trading-hours";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {buildGroups} from "./utils";

let pgClient: IDatabase<any>;
let pgp: IMain;

const run = async () => {
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

    try {
        await start(marketService, repository, iex)
    } catch (e) {
        console.error(e)
        throw e
    }
}

const start = async (marketService: MarketTradingHours, repository: Repository, iex: IEX) => {
    const marketIsOpen = await marketService.isOpen();
    if (!marketIsOpen) return;

    const securities = await repository.getUsExchangedListSecuritiesWithPricing();
    const securityGroups: getSecurityBySymbol[][] = buildGroups(securities);

    const securitiesMap: Record<string, getSecurityWithLatestPrice> = {};
    securities.forEach((sec: getSecurityWithLatestPrice) => securitiesMap[sec.symbol] = sec)

    const currentTime = DateTime.now().setZone("America/New_York").set({second: 0, millisecond: 0}).toJSDate();
    for (let i = 0; i < securityGroups.length; i++) {
        let securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);
        const response = await iex.bulk(symbols, ["quote"]);

        let securityPrices: addSecurityPrice[] = [];
        securityGroup.forEach(sec => {
            const {symbol, id} = sec;
            if (response[symbol] === undefined || response[symbol] === null) {
                const s = securitiesMap[symbol]
                if (s.latestPrice === undefined || s.latestPrice === null) return
                securityPrices.push({
                    price: s.latestPrice,
                    high: s.latestHigh,
                    low: s.latestLow,
                    open: s.latestOpen,
                    securityId: id,
                    time: currentTime
                });
                return;
            }

            const quote = (response[symbol].quote as GetQuote)
            if (quote.latestPrice === undefined || quote.latestPrice === null) {
                const s = securitiesMap[symbol]
                if (s.latestPrice === undefined || s.latestPrice === null) return
                securityPrices.push({
                    price: s.latestPrice,
                    open: s.latestOpen,
                    low: s.latestLow,
                    high: s.latestHigh,
                    securityId: id,
                    time: currentTime
                });
                return;
            }

            securityPrices.push({
                price: quote.latestPrice,
                high: quote.high ? quote.high : quote.latestPrice,
                low: quote.low ? quote.low : quote.latestPrice,
                open: quote.open ? quote.open : quote.open,
                securityId: id,
                time: currentTime
            })
        });

        await repository.addSecuritiesPrices(securityPrices);
    }
}

// Pricing Charge
// Total Securities W/Out OTC : 11,847
// Total Securities W/ OTC: 26,746
// Per Day Charge = 390 * 26746 = 10,430,940
// Per Month = 219,049,740
// Per Month w/out OTC min-min = 11,847 * 390 = 4,620,330 * 21 = 97,026,930
module.exports.run = async (event: any, context: Context) => {
    await run();
};