import 'dotenv/config'
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Context} from "aws-lambda";
import {Client} from "pg";
import {Repository} from '../../services/market-data/repository';

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgClient = new Client({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database,
        port: 5432,
    });

    await pgClient.connect();
    const repository = new Repository(pgClient);
    await start(repository)
    await pgClient.end();
}

const start = async (repository: Repository) => {
    await repository.removeSecurityPricesAfter7Days()
}

module.exports.run = async (event: any, context: Context) => {
    await run();
};