import 'dotenv/config';
import {Context} from "aws-lambda";
import {DefaultTwitter} from "@tradingpost/common/social-media/twitter/service";
import {DefaultConfig} from "@tradingpost/common/configuration";
import PostPrepper from "@tradingpost/common/post-prepper";
import {Browser} from "puppeteer";
import {init} from "../init/init";

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

    const {pgp, pgClient, elasticService} = await init;

    const postPrepper = new PostPrepper()

    // @ts-ignore
    await postPrepper.init(browser);

    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    const twitter = DefaultTwitter(twitterConfiguration, pgClient, pgp, postPrepper, elasticService);
    await twitter.importTweets();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}