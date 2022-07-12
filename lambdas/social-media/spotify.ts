import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportEpisodes} from "../../services/data-processing/podcasts/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Client} from "pg";

const run = async () => {
    try {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");
        const pgClient = new Client({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });

        await lambdaImportEpisodes(pgClient, spotifyConfiguration);
        await pgClient.end()
    } catch (e) {
        console.error(e)
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}