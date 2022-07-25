import { ensureServerExtensions } from ".";
import { DefaultConfig } from "../../../configuration";
import { PublicError } from "../static/EntityApiBase";
import Post from './Post'
import { Client as ElasticClient } from '@elastic/elasticsearch';

let postsPerPage = 5;

export default ensureServerExtensions<Omit<Post, "setPostsPerPage">>({
    feed: async (req) => {
        if (req.body.page === null || req.body.page === undefined)
            throw new PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        if (page * postsPerPage + 20 > 10000)
            return [];
        const indexName = "tradingpost-search";
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
        // const response = await elasticClient.search({
        //     index: indexName,
        //     size: postsPerPage,
        //     from: page * postsPerPage,
        //     query: {
        //         function_score: {
        //             query: {
        //                 function_score: {
        //                     query: { match_all: {} },
        //                     // @ts-ignore
        //                     gauss: {
        //                         platformCreatedAt: {
        //                             origin: "now-1h",
        //                             scale: "1d"
        //                         }
        //                     }
        //                 }
        //             },
        //             field_value_factor: {
        //                 field: "postTypeValue",
        //                 factor: 1,
        //                 modifier: "none"

        //             }
        //         }
        //     }
        // });
        //Twitter test
        // const response = await elasticClient.search({
        //     index: indexName,
        //     size: postsPerPage,
        //     from: page * postsPerPage,
        //     query: {
        //         //         function_score: {
        // //             query: {
        // //                 function_score: {
        // //                     query: { match_all: {} },
        // //                     // @ts-ignore
        // //                     gauss: {
        // //                         platformCreatedAt: {
        // //                             origin: "now-1h",
        // //                             scale: "1d"
        // //                         }
        // //                     }
        // //                 }
        // //             },
        // //             field_value_factor: {
        // //                 field: "postTypeValue",
        // //                 factor: 1,
        // //                 modifier: "none"

        // //             }
        // //         }
        // //     }
        //         bool: {
        //             must: {
        //                 exists: {
        //                     field: "size"
        //                 },
        //                 terms:{
        //                     postType:["tweet", "spotify","youtube"]
        //                 }
        //             }
        //         }
        //     }
        // });

        const response = await elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: {
                bool: {
                    must: {
                        terms: {
                            postType: ["spotify","youtube"]
                        }
                    }
                }
            }
        });

        const { hits } = response.hits;
        return hits
    }
})