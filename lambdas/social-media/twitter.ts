import 'dotenv/config';
import {Context} from "aws-lambda";
import pg from 'pg';
import {DefaultTwitter} from "@tradingpost/common/social-media/twitter/service";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import PostPrepper from "@tradingpost/common/post-prepper";
import {Browser} from "puppeteer";
import ElasticService from "@tradingpost/common/elastic";
import {Client as ElasticClient} from "@elastic/elasticsearch";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

let pgClient: IDatabase<any>;
let pgp: IMain;
let browser: Browser;

const runLambda = async () => {
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        const chromium = require('@sparticuz/chromium');
        const puppeteer = require('puppeteer-core');

        // @ts-ignore
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
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
    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");

    const esClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration.cloudId
        },
        auth: {
            apiKey: elasticConfiguration.apiKey
        },
        maxRetries: 5,
    });

    // @ts-ignore
    const elasticService = new ElasticService(esClient, "tradingpost-search");

    // @ts-ignore
    await postPrepper.init(browser);

    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    const twitter = DefaultTwitter(twitterConfiguration, pgClient, pgp, postPrepper, elasticService);

    try {
        await twitter.importTweets();
    } catch (e) {
        console.error(e)
        throw e;
    }
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}