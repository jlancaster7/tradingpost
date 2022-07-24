import 'dotenv/config'
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Context} from "aws-lambda";
import {Repository} from '@tradingpost/common/market-data/repository';
import pgPromise, {IDatabase, IMain} from "pg-promise";

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

    const repository = new Repository(pgClient, pgp);

    try {
        await start(repository)
    } catch (e) {
        console.error(e)
        throw e
    }
}

const start = async (repository: Repository) => {
    await repository.removeSecurityPricesAfter7Days()
}

module.exports.run = async (event: any, context: Context) => {
    await run();
};