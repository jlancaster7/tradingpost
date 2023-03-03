import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import Repository from "@tradingpost/common/market-data/repository";
import IEX from "@tradingpost/common/iex";
import Holidays from "@tradingpost/common/market-data/holidays";
import MarketData from "@tradingpost/common/market-data";
import {DateTime} from "luxon";
import pgPromise, {IDatabase, IMain} from "pg-promise";
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
let iex: IEX;

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
        const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
        iex = new IEX(iexConfiguration.key);
    }

    const repository = new Repository(pgClient, pgp);
    const marketData = new MarketData(repository, iex);
    const marketHolidays = new Holidays(repository);

    const currentTime = DateTime.now().setZone("America/New_York")
    // if (currentTime.hour !== 16) return;
    // if (!await marketHolidays.isTradingDay(currentTime)) return

    try {
        await marketData.ingestEodOfDayPricing();
    } catch (e) {
        throw e;
    }
}

(async () => {
    console.log("Start")
    await runLambda();
    console.log("End")
})()

export const run = async (event: any, context: Context) => {
    await runLambda();
};