import 'dotenv/config';
import {Context} from "aws-lambda";
import {lambdaImportRSSFeeds} from "@tradingpost/common/social-media/rss_feeds/import";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import PostPrepper from "@tradingpost/common/post-prepper";
import {Browser} from 'puppeteer';

let pgClient: IDatabase<any>;
let pgp: IMain;
let browser: Browser;

const runLambda = async () => {
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        const chromium = require('@sparticuz/chrome-aws-lambda');
        // @ts-ignore
        browser = await chromium.puppeteer.launch({
            // @ts-ignore
            args: chromium.args,
            // @ts-ignore
            defaultViewport: chromium.defaultViewport,
            // @ts-ignore
            executablePath: await chromium.executablePath,
            // @ts-ignore
            headless: chromium.headless,
            // @ts-ignore
            ignoreHTTPSErrors: true,
        });
    }

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

    const postPrepper = new PostPrepper()

    // @ts-ignore
    await postPrepper.init(browser);

    try {
        await lambdaImportRSSFeeds(pgClient, pgp, postPrepper);
    } catch (e) {
        console.error(e)
        throw e
    }
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}