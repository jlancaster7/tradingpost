import {Context} from "aws-lambda";
import {lambdaImportRSSFeeds} from "../../services/data-processing/rss_feeds/imports";

const run = async () => {
    await lambdaImportRSSFeeds();
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}