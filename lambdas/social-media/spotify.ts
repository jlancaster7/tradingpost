import {Context} from "aws-lambda";
import {lambdaImportEpisodes} from "../../services/data-processing/podcasts/imports";

const run = async () => {
    await lambdaImportEpisodes();
}

module.exports.run = async (event: any, context: Context) => {
    await run();
}