import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Client} from "pg";
import {Repository} from "../../services/market-data/repository";
import {addSecurityPrice, getSecurityBySymbol} from '../../services/market-data/interfaces';
import IEX from "@tradingpost/common/iex";
import {GetQuote} from "@tradingpost/common/iex";
import {DateTime} from "luxon";
import Index from "../../services/market-data";

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgClient = new Client({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database,
        port: 5432,
    });

    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);
    await pgClient.connect();
    const repository = new Repository(pgClient);
    const marketService = new Index(repository);
    await start(pgClient, marketService, repository, iex)
    await pgClient.end();
}

const start = async (pgClient: Client, marketService: Index, repository: Repository, iex: IEX) => {
    const open = DateTime.now().setZone("America/New_York").set({hour: 9, minute: 29, second: 0, millisecond: 0});
    const close = DateTime.now().setZone("America/New_York").set({hour: 16, minute: 1, second: 0, millisecond: 0})

    let d = DateTime.now().setZone("America/New_York").set({second: 0, millisecond: 0});

    if (d.toSeconds() >= close.toSeconds() || d.toSeconds() <= open.toSeconds()) return

    const isTradingDay = await marketService.isTradingDay(d);
    if (!isTradingDay) return;

    const securities = await repository.getUSExchangeListedSecurities();
    const securityGroups: getSecurityBySymbol[][] = buildGroups(securities);

    const currentTime = d.toJSDate();
    for (let i = 0; i < securityGroups.length; i++) {
        let securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);
        const response = await iex.bulk(symbols, ["quote"]);
        let securityPrices: addSecurityPrice[] = [];
        securityGroup.forEach(sec => {
            const {symbol, id} = sec;
            if (response[symbol] === undefined || response[symbol] === null) return;
            const quote = (response[symbol].quote as GetQuote)
            if (quote.latestPrice === undefined || quote.latestPrice === null) return;
            securityPrices.push({price: quote.latestPrice, securityId: id, time: currentTime})
        });
        await repository.addSecuritiesPrices(securityPrices);
    }
}

const buildGroups = (securities: any[], max: number = 100): any[][] => {
    let groups: any[][] = [];
    let group: any[] = [];
    securities.forEach(sec => {
        group.push(sec)
        if (group.length === max) {
            groups.push(group);
            group = [];
        }
    });

    if (group.length > 0) groups.push(group);

    return groups;
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