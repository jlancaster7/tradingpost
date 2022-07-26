import 'dotenv/config';
process.env.CONFIGURATION_ENV = "production";
import {Context} from "aws-lambda";
import {lambdaImportTweets} from "@tradingpost/common/social-media/twitter";
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
        //await pgClient.connect()
    }
    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    try {
        await lambdaImportTweets(pgClient, pgp, twitterConfiguration);
        pgp.end();
    } catch (e) {
        pgp.end();
        console.error(e)
        throw e;
    }
}

run();

module.exports.run = async (event: any, context: Context) => {
    await run();
}