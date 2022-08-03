"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const elasticsearch_1 = require("@elastic/elasticsearch");
const configuration_1 = require("../../configuration");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const indexName = "tradingpost-search";
    //const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
    console.log(elasticConfiguration);
    let elasticClient = null;
    try {
        elasticClient = new elasticsearch_1.Client({
            cloud: {
                id: elasticConfiguration['cloudId']
            },
            auth: {
                apiKey: elasticConfiguration['apiKey']
            },
            maxRetries: 5,
        });
    }
    catch (ex) {
        console.log("WHAT THE FUCK");
    }
    if (elasticClient) {
        try {
            // Get Users Following IDs
            const response = yield elasticClient.search({
                index: indexName,
                size: 50,
                from: 0,
                query: {
                    function_score: {
                        query: {
                            function_score: {
                                query: { match_all: {} },
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
            const { hits } = response.hits;
            console.log(JSON.stringify(hits));
        }
        catch (ex) {
            console.error(ex);
        }
    }
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdHMtc2FtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicG9zdHMtc2FtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEseUJBQXVCO0FBQ3ZCLDBEQUFpRTtBQUNqRSx1REFBb0Q7QUFFcEQsQ0FBQyxHQUFTLEVBQUU7SUFDVixNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztJQUN2QywrRUFBK0U7SUFDL0UsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNsQyxJQUFJLGFBQWEsR0FBeUIsSUFBSSxDQUFDO0lBQy9DLElBQUk7UUFDRixhQUFhLEdBQUcsSUFBSSxzQkFBYSxDQUFDO1lBQ2hDLEtBQUssRUFBRTtnQkFDTCxFQUFFLEVBQUUsb0JBQW9CLENBQUMsU0FBUyxDQUFXO2FBQzlDO1lBQ0QsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLENBQVc7YUFDakQ7WUFDRCxVQUFVLEVBQUUsQ0FBQztTQUNkLENBQUMsQ0FBQztLQUNKO0lBQ0QsT0FBTyxFQUFFLEVBQUU7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsSUFBSSxhQUFhLEVBQUU7UUFDakIsSUFBSTtZQUNGLDBCQUEwQjtZQUMxQixNQUFNLFFBQVEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQzFDLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJLEVBQUUsRUFBRTtnQkFDUixJQUFJLEVBQUUsQ0FBQztnQkFDUCxLQUFLLEVBQUU7b0JBQ0wsY0FBYyxFQUFFO3dCQUNkLEtBQUssRUFBRTs0QkFDTCxjQUFjLEVBQUU7Z0NBQ2QsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtnQ0FDeEIsYUFBYTtnQ0FDYixLQUFLLEVBQUU7b0NBQ0wsaUJBQWlCLEVBQUU7d0NBQ2pCLE1BQU0sRUFBRSxRQUFRO3dDQUNoQixLQUFLLEVBQUUsSUFBSTtxQ0FDWjtpQ0FDRjs2QkFDRjt5QkFDRjt3QkFDRCxrQkFBa0IsRUFBRTs0QkFDbEIsS0FBSyxFQUFFLGVBQWU7NEJBQ3RCLE1BQU0sRUFBRSxDQUFDOzRCQUNULFFBQVEsRUFBRSxNQUFNO3lCQUVqQjtxQkFDRjtpQkFDRjthQUNGLENBQUMsQ0FBQztZQUNILE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsT0FBTyxFQUFFLEVBQUU7WUFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO0tBQ0Y7QUFDSCxDQUFDLENBQUEsQ0FBQyxFQUFFLENBQUEifQ==