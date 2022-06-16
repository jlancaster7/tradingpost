import {Context} from 'aws-lambda';
import {Configuration} from "@tradingpost/common/configuration";
import {Client} from "pg";
import {Repository} from "../../services/market-data/repository";
import {addSecurityPrice, getSecurityBySymbol} from '../../services/market-data/interfaces';
import IEX from "@tradingpost/common/iex";
import {GetQuote} from "@tradingpost/common/iex";
import {DateTime} from "luxon";
import Index from "../../services/market-data";

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);


const run = async () => {
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const pgClient = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string,
        port: 5432,
    });
    const iexConfiguration = await configuration.fromSSM("/production/iex");
    const iex = new IEX(iexConfiguration.key as string);
    await pgClient.connect();
    const repository = new Repository(pgClient);
    const marketService = new Index(repository);
    await start(pgClient, marketService, repository, iex)
    await pgClient.end();
}

const start = async (pgClient: Client, marketService: Index, repository: Repository, iex: IEX) => {
    const isMarketOpen = await marketService.isMarketOpen();
    if (!isMarketOpen) return;

    const securities = await repository.getUSExchangeListedSecurities();
    const securityGroups: getSecurityBySymbol[][] = buildGroups(securities);

    // TODO: Get securities with latest price available, if iex latest price is null, then default to last price avail
    // TODO: Update so that we can run multiple at the same time....
    const currentTime = DateTime.now().set({second: 0, millisecond: 0}).toJSDate();
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