import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportTweets} from "../../services/data-processing/twitter/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Client} from "pg";

const run = async () => {
    try {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
        const pgClient = new Client({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });

        await lambdaImportTweets(pgClient, twitterConfiguration);
        await pgClient.end()
    } catch (e) {
        console.error(e)
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}