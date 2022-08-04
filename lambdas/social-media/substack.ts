import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportRSSFeeds} from "@tradingpost/common/social-media/rss_feeds/import";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";

let pgClient: IDatabase<any>;
let pgp: IMain;

const runLambda = async () => {
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

    try {
        await lambdaImportRSSFeeds(pgClient, pgp);
    } catch (e) {
        console.error(e)
        throw e
    }
}

module.exports.run = async (event: any, context: Context) => {
    await runLambda();
}