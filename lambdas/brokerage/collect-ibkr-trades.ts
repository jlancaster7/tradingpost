import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from '@tradingpost/common/brokerage/repository';
import Ibkr from "@tradingpost/common/brokerage/ibkr/index";
import {S3Client} from "@aws-sdk/client-s3";

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
    }

    const repository = new Repository(pgClient, pgp);
    const s3Client = new S3Client({region: "us-east-1"});
    const ibkrSrv = new Ibkr(repository, s3Client);

    // Check to see if any brokerages to process
    // Process
    // Update Portfolio / Holding History

}

export const handler = async (event: any, context: Context) => {
    await run();
}