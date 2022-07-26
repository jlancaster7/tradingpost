import 'dotenv/config';

process.env.CONFIGURATION_ENV = "production";
import {Context} from "aws-lambda";
import {lambdaImportTweets, addTwitterUsersByHandle} from "@tradingpost/common/social-media/twitter";
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

    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    try {
        await lambdaImportTweets(pgClient, pgp, twitterConfiguration);
    } catch (e) {
        console.error(e)
        throw e;
    }
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}