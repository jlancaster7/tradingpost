import {Context} from "aws-lambda";
import {lambdaImportYoutube} from "../../services/data-processing/youtube/imports";

const run = async () => {
    await lambdaImportYoutube();
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}