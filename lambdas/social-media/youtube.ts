import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportYoutube} from "../../services/data-processing/youtube/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Client} from "pg";

const run = async () => {
    try {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        const youtubeConfiguration = await DefaultConfig.fromCacheOrSSM("youtube");
        const pgClient = new Client({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        await lambdaImportYoutube(pgClient, youtubeConfiguration);
        await pgClient.end()
    } catch (e) {
        console.error(e)
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}