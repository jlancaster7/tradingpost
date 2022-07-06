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
        size: 50, 
        from: 0,
        query: {
          function_score: {
            query: {
              function_score: {
                query: {match_all: {}},
                // @ts-ignore
                gauss: {
                  platformCreatedAt: {
                    origin: "now-1h",
                    scale: "1d"
                  }
                }
              }
            },
            field_value_factor: {
              field: "postTypeValue",
              factor: 1,
              modifier: "none"
              
            }
          }
        }
    });
    const {hits} = response.hits;
    console.log(hits);
})()