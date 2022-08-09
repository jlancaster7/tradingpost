import 'dotenv/config';
process.env.CONFIGURATION_ENV = 'production';
import {Context} from "aws-lambda";
import {lambdaImportYoutube} from "@tradingpost/common/social-media/youtube/import";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";

let pgClient: IDatabase<any>;
let pgp: IMain;

const runLambda = async () => {
    const youtubeConfiguration = await DefaultConfig.fromCacheOrSSM("youtube");
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        await pgClient.connect()
    }

    try {
        await lambdaImportYoutube(pgClient, pgp, youtubeConfiguration);
    } catch (e) {
        console.error(e)
        throw e;
    }
}
runLambda();
export const run = async (event: any, context: Context) => {
    await runLambda();
}