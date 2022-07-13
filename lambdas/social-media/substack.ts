import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportRSSFeeds} from "../../services/data-processing/rss_feeds/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import ServerlessClient from "serverless-postgres";

const pgClient = new ServerlessClient({port: 5432});

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const substackConfiguration = await DefaultConfig.fromCacheOrSSM("substack");

    pgClient.setConfig({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()

    try {
        await lambdaImportRSSFeeds(pgClient, substackConfiguration);
    } catch (e) {
        console.error(e)
        throw e
    } finally {
        await pgClient.clean()
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}