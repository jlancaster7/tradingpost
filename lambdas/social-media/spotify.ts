import 'dotenv/config';
import {Context} from "aws-lambda";
import {DefaultSpotify} from "@tradingpost/common/social-media/spotify/service";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import ElasticService from "@tradingpost/common/elastic";
import {Client as ElasticClient} from '@elastic/elasticsearch'

let pgClient: IDatabase<any>;
let pgp: IMain;

const runLambda = async () => {
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

    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticService = new ElasticService(new ElasticClient({
        cloud: {
            id: elasticConfiguration.cloudId
        },
        auth: {
            apiKey: elasticConfiguration.apiKey
        },
        maxRetries: 5,
    }), "tradingpost-search");

    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");
    const spotify = DefaultSpotify(elasticService, pgClient, pgp, spotifyConfiguration)

    try {
        await spotify.importEpisodes()
    } catch (e) {
        console.error(e)
        throw e
    }
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}