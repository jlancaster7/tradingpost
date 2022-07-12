import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportRSSFeeds} from "../../services/data-processing/rss_feeds/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Client} from "pg";

const run = async () => {
    try {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        const substackConfiguration = await DefaultConfig.fromCacheOrSSM("substack");
        const pgClient = new Client({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });

        await lambdaImportRSSFeeds(pgClient, substackConfiguration);
        await pgClient.end()
    } catch (e) {
        console.error(e)
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}