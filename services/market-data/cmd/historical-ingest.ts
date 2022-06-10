import {Configuration} from "../lib/configuration";
import {IEX} from "../lib/iex";
import {Client} from "pg";
import {addSecurityPrice, Repository} from "../lib/repository";
import {DateTime} from 'luxon';

const fs = require('fs');

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);


const run = async () => {
    const completeSymbolsFile: string = fs.readFileSync("./cmd/complete.txt", 'utf8');
    const completeSymbols: string[] = completeSymbolsFile.split("\n").filter(r => r !== "");
    let processedSymbolMap: Record<string, object> = {};
    if (completeSymbols.length > 1) completeSymbols.forEach(symbol => {
        processedSymbolMap[symbol] = {}
    });

    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const iexConfiguration = await configuration.fromSSM("/production/iex");
    const iex = new IEX(iexConfiguration['key'] as string);
    const pgClient = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    });
    await pgClient.connect();

    const repository = new Repository(pgClient);
    const securities = await repository.getSecurities();
    let cnt = 0;
    let total = securities.length;
    for (const security of securities) {
        try {
            cnt = cnt + 1
            console.log(`Processing[${security.symbol}]. Total Processed[${cnt}/${total}]`, security.symbol);
            if (security.symbol in processedSymbolMap) {
                console.log(`\tAlready Found ${security.symbol}...`);
                continue;
            }

            let securityPrices: addSecurityPrice[] = [];
            const prices = await iex.getHistoricalPrices(security.symbol, {range: "max", chartCloseOnly: true});
            prices.forEach(p => {
                if (p.date === undefined || p.date === null || p.date === "") return;

                const date = DateTime.fromISO(p.date).setZone("America/New_York").set({
                    minute: 0,
                    hour: 16,
                    second: 0,
                    millisecond: 0
                }).toJSDate();

                securityPrices.push({price: p.close, securityId: security.id, time: date})
            });

            await repository.addSecuritiesPrices(securityPrices);
            fs.appendFileSync("./cmd/complete.txt", "\n" + security.symbol);
        } catch (e) {
            console.error(`getting data for ${security.symbol} err: ${e}`);
        }
    }
    await pgClient.end()
}

(async () => {
    await run();
})();