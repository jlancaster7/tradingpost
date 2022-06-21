import {Context} from "aws-lambda";
import {lambdaImportTweets} from "../../services/data-processing/twitter/imports";

const run = async () => {
    await lambdaImportTweets();
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}