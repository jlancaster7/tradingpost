import 'dotenv/config'
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Context} from "aws-lambda";
import Repository from '@tradingpost/common/market-data/repository';
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from "pg";
import MarketData from "@tradingpost/common/market-data/index";
import IEX from "@tradingpost/common/iex/index";

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

    const repository = new Repository(pgClient, pgp);
    const marketSrv = new MarketData(repository, new IEX(""));

    try {
        await marketSrv.prunePricing()
    } catch (e) {
        throw e
    }
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};