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
const _1 = require(".");
const configuration_1 = require("../../../configuration");
const EntityApiBase_1 = require("../static/EntityApiBase");
const elasticsearch_1 = require("@elastic/elasticsearch");
let postsPerPage = 5;
exports.default = (0, _1.ensureServerExtensions)({
    feed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.page === null || req.body.page === undefined)
            throw new EntityApiBase_1.PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        if (page * postsPerPage + 20 > 10000)
            return [];
        const indexName = "tradingpost-search";
        const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
        const elasticClient = new elasticsearch_1.Client({
            cloud: {
                id: elasticConfiguration['cloudId']
            },
            auth: {
                apiKey: elasticConfiguration['apiKey']
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
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: {
                bool: {
                    must: {
                        terms: {
                            postType: ["spotify", "youtube"]
                        }
                    }
                }
            }
        });
        const { hits } = response.hits;
        return hits;
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHdCQUEyQztBQUMzQywwREFBdUQ7QUFDdkQsMkRBQXNEO0FBRXRELDBEQUFpRTtBQUVqRSxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFFckIsa0JBQWUsSUFBQSx5QkFBc0IsRUFBZ0M7SUFDakUsSUFBSSxFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDaEIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUztZQUNyRCxNQUFNLElBQUksMkJBQVcsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLElBQUksR0FBRyxZQUFZLEdBQUcsRUFBRSxHQUFHLEtBQUs7WUFDaEMsT0FBTyxFQUFFLENBQUM7UUFDZCxNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztRQUN2QyxNQUFNLG9CQUFvQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0UsTUFBTSxhQUFhLEdBQUcsSUFBSSxzQkFBYSxDQUFDO1lBQ3BDLEtBQUssRUFBRTtnQkFDSCxFQUFFLEVBQUUsb0JBQW9CLENBQUMsU0FBUyxDQUFXO2FBQ2hEO1lBQ0QsSUFBSSxFQUFFO2dCQUNGLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLENBQVc7YUFDbkQ7WUFDRCxVQUFVLEVBQUUsQ0FBQztTQUNoQixDQUFDLENBQUM7UUFFSCwwQkFBMEI7UUFDMUIsZ0RBQWdEO1FBQ2hELHdCQUF3QjtRQUN4QiwwQkFBMEI7UUFDMUIsaUNBQWlDO1FBQ2pDLGVBQWU7UUFDZiw0QkFBNEI7UUFDNUIsdUJBQXVCO1FBQ3ZCLG9DQUFvQztRQUNwQyxnREFBZ0Q7UUFDaEQsb0NBQW9DO1FBQ3BDLCtCQUErQjtRQUMvQiwrQ0FBK0M7UUFDL0MsZ0RBQWdEO1FBQ2hELDBDQUEwQztRQUMxQyw0QkFBNEI7UUFDNUIsd0JBQXdCO1FBQ3hCLG9CQUFvQjtRQUNwQixpQkFBaUI7UUFDakIsb0NBQW9DO1FBQ3BDLDBDQUEwQztRQUMxQyw2QkFBNkI7UUFDN0IsbUNBQW1DO1FBRW5DLGdCQUFnQjtRQUNoQixZQUFZO1FBQ1osUUFBUTtRQUNSLE1BQU07UUFDTixjQUFjO1FBQ2QsZ0RBQWdEO1FBQ2hELHdCQUF3QjtRQUN4QiwwQkFBMEI7UUFDMUIsaUNBQWlDO1FBQ2pDLGVBQWU7UUFDZix1Q0FBdUM7UUFDdkMsMEJBQTBCO1FBQzFCLHVDQUF1QztRQUN2QyxtREFBbUQ7UUFDbkQsdUNBQXVDO1FBQ3ZDLGtDQUFrQztRQUNsQyxrREFBa0Q7UUFDbEQsbURBQW1EO1FBQ25ELDZDQUE2QztRQUM3QywrQkFBK0I7UUFDL0IsMkJBQTJCO1FBQzNCLHVCQUF1QjtRQUN2QixvQkFBb0I7UUFDcEIsdUNBQXVDO1FBQ3ZDLDZDQUE2QztRQUM3QyxnQ0FBZ0M7UUFDaEMsc0NBQXNDO1FBRXRDLG1CQUFtQjtRQUNuQixlQUFlO1FBQ2YsV0FBVztRQUNYLGtCQUFrQjtRQUNsQixzQkFBc0I7UUFDdEIsNEJBQTRCO1FBQzVCLG9DQUFvQztRQUNwQyxxQkFBcUI7UUFDckIsMEJBQTBCO1FBQzFCLDhEQUE4RDtRQUM5RCxvQkFBb0I7UUFDcEIsZ0JBQWdCO1FBQ2hCLFlBQVk7UUFDWixRQUFRO1FBQ1IsTUFBTTtRQUVOLE1BQU0sUUFBUSxHQUFHLE1BQU0sYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUN4QyxLQUFLLEVBQUUsU0FBUztZQUNoQixJQUFJLEVBQUUsWUFBWTtZQUNsQixJQUFJLEVBQUUsSUFBSSxHQUFHLFlBQVk7WUFDekIsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRTtvQkFDRixJQUFJLEVBQUU7d0JBQ0YsS0FBSyxFQUFFOzRCQUNILFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBQyxTQUFTLENBQUM7eUJBQ2xDO3FCQUNKO2lCQUNKO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUMvQixPQUFPLElBQUksQ0FBQTtJQUNmLENBQUMsQ0FBQTtDQUNKLENBQUMsQ0FBQSJ9