import 'dotenv/config';
import {Context} from "aws-lambda";
import {DefaultSpotify} from "@tradingpost/common/social-media/spotify/service";
import {DefaultConfig} from "@tradingpost/common/configuration";
import {init} from "../init/init";

const runLambda = async () => {
    const {pgp, pgClient, elasticService} = await init;
    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");
    const spotify = DefaultSpotify(elasticService, pgClient, pgp, spotifyConfiguration)
    await spotify.importEpisodes()
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}