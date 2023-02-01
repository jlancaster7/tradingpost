import 'dotenv/config'
import {DefaultConfig} from '../../configuration';
import { DefaultYoutube } from './service';
import Repository from '../repository'
import {IDatabase, IMain} from "pg-promise";
import pgPromise from "pg-promise";
import Twitter from "./";
import PostPrepper from "../../post-prepper";
import ElasticService from "../../elastic";
import {Client as ElasticClient} from '@elastic/elasticsearch';

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()
    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration.cloudId as string
        },
        auth: {
            apiKey: elasticConfiguration.apiKey as string
        },
        maxRetries: 5,
    })

    const indexName = "tradingpost-search";
    const elasticService = new ElasticService(elasticClient, indexName);

    const postPrepper = new PostPrepper();

    const youtubeConfiguration = await DefaultConfig.fromCacheOrSSM("youtube");
    const youtube = DefaultYoutube(youtubeConfiguration, pgClient, pgp, elasticService);

    await youtube.importUsersById(['https://www.youtube.com/channel/UC0JCwH1VkBbIZOAIPufdgyQ'])
}
run();