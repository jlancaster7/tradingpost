import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportEpisodes} from "../../services/data-processing/podcasts/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import ServerlessClient from "serverless-postgres";

const pgClient = new ServerlessClient({port: 5432});

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");

    pgClient.setConfig({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()

    try {
        await lambdaImportEpisodes(pgClient, spotifyConfiguration);
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