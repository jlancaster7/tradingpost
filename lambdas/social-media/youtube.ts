import 'dotenv/config';
import {Context} from "aws-lambda";
import {DefaultYoutube} from "@tradingpost/common/social-media/youtube/service";
import {DefaultConfig} from "@tradingpost/common/configuration";
import {init} from "../init/init";

const runLambda = async () => {
    const {pgp, pgClient, elasticService} = await init;
    const youtubeCfg = await DefaultConfig.fromCacheOrSSM("youtube");
    const youtube = DefaultYoutube(youtubeCfg, pgClient, pgp, elasticService);
    await youtube.import();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}