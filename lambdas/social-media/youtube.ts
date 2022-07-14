import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportYoutube} from "../../services/data-processing/youtube/imports";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";

let pgClient: IDatabase<any>;
let pgp: IMain;

const run = async () => {
    const youtubeConfiguration = await DefaultConfig.fromCacheOrSSM("youtube");

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

    await pgClient.connect()

    try {
        await lambdaImportYoutube(pgClient, youtubeConfiguration);
    } catch (e) {
        console.error(e)
        throw e;
    } finally {
        await pgp.end()
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}