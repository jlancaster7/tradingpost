import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportEpisodes} from "@tradingpost/common/social-media/podcasts/import"
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";

let pgClient: IDatabase<any>;
let pgp: IMain;

const run = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })
        await pgClient.connect()
    }

    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");

    try {
        await lambdaImportEpisodes(pgClient, pgp, spotifyConfiguration);
    } catch (e) {
        console.error(e)
        throw e
    }
}

module.exports.run = async (event: any, context: Context) => {
    console.log("Starting")
    await run();
    console.log("Ended")
}