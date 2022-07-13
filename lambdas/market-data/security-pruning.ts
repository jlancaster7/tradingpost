import 'dotenv/config'
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Context} from "aws-lambda";
import {Repository} from '../../services/market-data/repository';
import ServerlessClient from "serverless-postgres";

const pgClient = new ServerlessClient({port: 5432});

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");

    pgClient.setConfig({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect();

    const repository = new Repository(pgClient);

    try {
        console.log("Running")
        await start(repository)
    } catch (e) {
        console.error(e)
        throw e
    } finally {
        await pgClient.clean()
    }
}

const start = async (repository: Repository) => {
    await repository.removeSecurityPricesAfter7Days()
}

module.exports.run = async (event: any, context: Context) => {
    await run();
};

(async() => {
   await run()
})()