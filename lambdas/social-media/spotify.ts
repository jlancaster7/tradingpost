import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportEpisodes} from "../../services/data-processing/podcasts/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";

let pgClient: IDatabase<any>;
let pgp: IMain;

const run = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration['host'] as string,
            user: postgresConfiguration['user'] as string,
            password: postgresConfiguration['password'] as string,
            database: postgresConfiguration['database'] as string
        })
    }

    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");
    await pgClient.connect()

    try {
        await lambdaImportEpisodes(pgClient, spotifyConfiguration);
    } catch (e) {
        console.error(e)
        throw e
    } finally {
        await pgp.end()
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}