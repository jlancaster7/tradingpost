import 'dotenv/config';
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {DefaultConfig} from "@tradingpost/common/configuration";

(async () => {
    const indexName = "tradingpost-search";
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration['cloudId'] as string
        },
        auth: {
            apiKey: elasticConfiguration['apiKey'] as string
        },
        maxRetries: 5,
    });

    // Get Users Following IDs
    const response = await elasticClient.search({
        index: indexName,
        query: {
            bool: {
                must: [
                    {
                        match: {"platform.displayName": "joshua"}
                    }
                ],
                filter: [
                    {
                        terms: {
                            "user.id": [4973, 4972] // User IDs who our requesting user is subscribed too
                        }
                    }
                ]
            }
        },
        sort: [
            // @ts-ignore
            {
                platformCreatedAt: {order: "desc"}
            }
        ]
    });
    const {hits} = response.hits;
    console.log(hits);
})()