import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import Repository from "@tradingpost/common/market-data/repository";
import {
    addSecurityPrice, getSecurityWithLatestPrice
} from '@tradingpost/common/market-data/interfaces';
import IEX, {GetIntraDayPrices} from "@tradingpost/common/iex";
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
    let currentTime = DateTime.now().setZone("America/New_York")

    const isTradingDay = await marketService.isTradingDay(currentTime);
    if (!isTradingDay) return;

    if (currentTime.hour > 16 && currentTime.minute > 30) return

    const securities = await repository.getUsExchangedListSecuritiesWithPricing();
    const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);

    let securityPrices: addSecurityPrice[] = [];
    for (let i = 0; i < securityGroups.length; i++) {
        let securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);

        try {
            const response = await iex.bulk(symbols, ["intraday-prices"], {
                chartIEXWhenNull: true,
                chartLast: 1
            });
            let prices = await perform(securityGroup, response)
            securityPrices = [...securityPrices, ...prices]
        } catch (err) {
            for (let i = 0; i < securityGroup.length; i++) {
                const sec = securityGroup[i];
                try {
                    const response = await iex.bulk([sec.symbol], ["intraday-prices"], {
                        chartIEXWhenNull: true,
                        chartLast: 1
                    });
                    let prices = await perform([sec], response)
                    securityPrices = [...securityPrices, ...prices]
                } catch (err) {
                    console.log(sec.symbol)
                    console.error(err)
                }
            }
        }
    }

    await repository.addSecuritiesPrices(securityPrices);
}

const perform = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>): Promise<addSecurityPrice[]> => {
    let securityPrices: addSecurityPrice[] = [];
    securityGroup.forEach(sec => {
        const {symbol, id} = sec;
        if (response[symbol] === undefined || response[symbol] === null) return;

        const intradayPrices = (response[symbol]['intraday-prices'] as GetIntraDayPrices[])
        if (intradayPrices.length <= 0) return;

        const lp = intradayPrices[0];
        const time = DateTime.fromFormat(`${lp.date} ${lp.minute}`, "yyyy-LL-dd HH:mm", {
            zone: "America/New_York"
        });

        // If no avail price, default to what was previous available for this security
        securityPrices.push({
            price: lp.close ? lp.close : sec.latestPrice,
            high: lp.high ? lp.high : sec.latestHigh,
            low: lp.low ? lp.low : sec.latestLow,
            open: lp.open ? lp.open : sec.latestOpen,
            securityId: id,
            time: time.toJSDate()
        })
    });

    return securityPrices
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