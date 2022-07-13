import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportTweets} from "../../services/data-processing/twitter/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import ServerlessClient from "serverless-postgres";

const pgClient = new ServerlessClient({port: 5432});

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");

    pgClient.setConfig({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()

    try {
        await lambdaImportTweets(pgClient, twitterConfiguration);
    } catch (e) {
        console.error(e)
        throw e;
    } finally {
        await pgClient.clean()
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}