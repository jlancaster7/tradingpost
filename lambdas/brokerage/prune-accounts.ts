import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
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


const run = async () => {
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
}

export const handler = async (event: any, context: Context) => {
    await run();
}