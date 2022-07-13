import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportYoutube} from "../../services/data-processing/youtube/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import ServerlessClient from "serverless-postgres";

const pgClient = new ServerlessClient({port: 5432});

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const youtubeConfiguration = await DefaultConfig.fromCacheOrSSM("youtube");
    pgClient.setConfig({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()

    try {
        await lambdaImportYoutube(pgClient, youtubeConfiguration);
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