import IEX, {GetHistoricalPrice, GetIntraDayPrices} from "@tradingpost/common/iex";
import {Client} from 'pg';
import {Configuration} from "@tradingpost/common/configuration";
import {Repository} from "./repository";
import {addSecurityPrice, getSecurityBySymbol} from "./interfaces";
import {DateTime} from "luxon";

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);

const run = async () => {
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const iexConfiguration = await configuration.fromSSM("/production/iex");
    const iex = new IEX(iexConfiguration['key'] as string);
    const pgClient = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string,
        port: 5432,
    });

    await pgClient.connect();

    const repository = new Repository(pgClient);
    const securities: getSecurityBySymbol[] = await repository.getSecurities()
    let groups: getSecurityBySymbol[][] = [];
    let group: getSecurityBySymbol[] = []
    let securitiesMap: Record<string, getSecurityBySymbol> = {}
    for (const security of securities) {
        securitiesMap[security.symbol] = security
        group.push(security);
        if (group.length === 100) {
            groups.push(group);
            group = [];
        }
    }

    if (group.length > 0) {
        groups.push(group);
    }

    let cnt = 0;
    let len = groups.length;
    for (const group of groups) {
        cnt = cnt + 1
        console.log(`Processing ${cnt}/${groups.length}`);
        let symbols: string[] = group.map((g: getSecurityBySymbol) => g.symbol);
        try {
            const symbolsWithPrices = await iex.bulk(symbols, ['chart'], {
                chartCloseOnly: true,
                range: 'max',
                chartLast: 6
            });

            const securityPrices: addSecurityPrice[] = [];
            Object.keys(symbolsWithPrices).forEach(symbol => {
                const prices: GetHistoricalPrice[] = symbolsWithPrices[symbol]['chart'];
                const security: getSecurityBySymbol = securitiesMap[symbol];
                if (!security) return;
                if (!prices) return;

                prices.forEach((p: GetHistoricalPrice) => {
                    if (p.date === null) return;
                    const dt = DateTime.fromISO(p.date).setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    })

                    if (p.close === null) return;
                    securityPrices.push({
                        price: p.close,
                        securityId: security.id,
                        time: dt.toJSDate()
                    })
                });
            });
            await repository.upsertSecuritiesPrices(securityPrices)
        } catch (e) {
            console.error(e)
        }
    }

    await pgClient.end();
}

(async () => {
    await run();
})()