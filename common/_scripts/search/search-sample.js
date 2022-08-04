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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const elasticsearch_1 = require("@elastic/elasticsearch");
const configuration_1 = require("../../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const yargs_1 = __importDefault(require("yargs"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const indexName = "tradingpost-search";
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
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
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    const argv = (0, yargs_1.default)(process.argv.slice(2)).argv;
    // @ts-ignore
    //console.log(argv.test);
    const searchTerm = argv.test;
    /*
    let query = `SELECT symbol, company_name, market_cap, industry FROM security
                  LEFT JOIN security_information
                  ON security.id = security_information.security_id
                  WHERE sector IN (SELECT sector FROM security WHERE symbol = $1 AND issue_type ='cs')
                  AND issue_type = 'cs'
                  AND security_information.market_cap
                      BETWEEN ((SELECT market_cap FROM security_information
                            LEFT JOIN security
                            ON security.id = security_information.security_id
                            WHERE symbol = $1) * .75)
                      AND ((SELECT market_cap FROM security_information
                          LEFT JOIN security
                          ON security.id = security_information.security_id
                          WHERE symbol = $1) * 1.25)
                  AND symbol != $1
                  limit 5
                `;
    const repo = await pgClient.any(query, [searchTerm.slice(1)]);
    const similarTerm = repo.map(a => '$' + a.symbol).join(',');
    */
    // Get Users Following IDs
    const response = yield elasticClient.search({
        index: indexName,
        size: 20,
        from: 0,
        "query": {
            "function_score": {
                "query": {
                    "function_score": {
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "match": {
                                            "content.body": {
                                                "analyzer": "synonym_analyzer",
                                                "query": searchTerm,
                                                "boost": 1
                                            }
                                        }
                                    },
                                    {
                                        "match": {
                                            "content.title": {
                                                "analyzer": "synonym_analyzer",
                                                "query": searchTerm,
                                                "boost": 1
                                            }
                                        }
                                    } /*,
                                    {
                                      "match": {
                                        "content.body": {
                                          "analyzer": "synonym_analyzer",
                                          "query": similarTerm,
                                          "boost": 0.01
                                        }
                                      }},
                                      {
                                        "match": {
                                          "content.title": {
                                            "analyzer": "synonym_analyzer",
                                            "query": similarTerm,
                                            "boost": 0.01
                                          }
                                        }}*/
                                ],
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                        },
                        // @ts-ignore
                        "gauss": {
                            "platformCreatedAt": {
                                "origin": "now-1h",
                                "scale": "7d"
                            }
                        },
                        "boost": 1
                    }
                },
                "field_value_factor": {
                    "field": "postTypeValue",
                    "factor": 2,
                    "modifier": "sqrt"
                }
            }
        }
    });
    const { hits } = response.hits;
    hits.forEach((a) => {
        // @ts-ignore
        //console.log([a._score, a._source.id, a._source.content.body, a._source.platformCreatedAt]);
    });
    pgp.end();
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLXNhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlYXJjaC1zYW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBdUI7QUFDdkIsMERBQStEO0FBQy9ELHVEQUFvRDtBQUNwRCw0REFBbUM7QUFDbkMsa0RBQTBCO0FBRTFCLENBQUMsR0FBUyxFQUFFO0lBQ1IsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUM7SUFDdkMsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdFLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzRSxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFhLENBQUM7UUFDcEMsS0FBSyxFQUFFO1lBQ0gsRUFBRSxFQUFFLG9CQUFvQixDQUFDLFNBQVMsQ0FBVztTQUNoRDtRQUNELElBQUksRUFBRTtZQUNGLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLENBQVc7U0FDbkQ7UUFDRCxVQUFVLEVBQUUsQ0FBQztLQUNoQixDQUFDLENBQUM7SUFDSCxNQUFNLEdBQUcsR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1FBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1FBQ2hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1FBQ3hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO0tBQzNDLENBQUMsQ0FBQztJQUVILE1BQU0sSUFBSSxHQUFHLElBQUEsZUFBSyxFQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQy9DLGFBQWE7SUFDYix5QkFBeUI7SUFDekIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFvQkU7SUFFRiwwQkFBMEI7SUFDMUIsTUFBTSxRQUFRLEdBQUcsTUFBTSxhQUFhLENBQUMsTUFBTSxDQUFDO1FBQ3hDLEtBQUssRUFBRSxTQUFTO1FBQ2hCLElBQUksRUFBRSxFQUFFO1FBQ1IsSUFBSSxFQUFFLENBQUM7UUFDUCxPQUFPLEVBQUU7WUFDUCxnQkFBZ0IsRUFBRTtnQkFDaEIsT0FBTyxFQUFFO29CQUNQLGdCQUFnQixFQUFFO3dCQUNoQixPQUFPLEVBQUU7NEJBQ1AsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUjt3Q0FDRSxPQUFPLEVBQUU7NENBQ1AsY0FBYyxFQUFFO2dEQUNkLFVBQVUsRUFBRSxrQkFBa0I7Z0RBQzlCLE9BQU8sRUFBRSxVQUFVO2dEQUNuQixPQUFPLEVBQUUsQ0FBQzs2Q0FDWDt5Q0FDSjtxQ0FBQztvQ0FDRjt3Q0FDRSxPQUFPLEVBQUU7NENBQ1AsZUFBZSxFQUFFO2dEQUNmLFVBQVUsRUFBRSxrQkFBa0I7Z0RBQzlCLE9BQU8sRUFBRSxVQUFVO2dEQUNuQixPQUFPLEVBQUUsQ0FBQzs2Q0FDWDt5Q0FDRjtxQ0FBQyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7OzRDQWdCTTtpQ0FDWDtnQ0FDRCxzQkFBc0IsRUFBRSxDQUFDO2dDQUN6QixPQUFPLEVBQUUsQ0FBQzs2QkFDYjt5QkFDRjt3QkFDQyxhQUFhO3dCQUNiLE9BQU8sRUFBRTs0QkFDUCxtQkFBbUIsRUFBRTtnQ0FDbkIsUUFBUSxFQUFFLFFBQVE7Z0NBQ2xCLE9BQU8sRUFBRSxJQUFJOzZCQUNkO3lCQUNGO3dCQUNELE9BQU8sRUFBRSxDQUFDO3FCQUNYO2lCQUNGO2dCQUNELG9CQUFvQixFQUFFO29CQUNwQixPQUFPLEVBQUUsZUFBZTtvQkFDeEIsUUFBUSxFQUFFLENBQUM7b0JBQ1gsVUFBVSxFQUFFLE1BQU07aUJBQ25CO2FBQ0Y7U0FDRjtLQUNKLENBQUMsQ0FBQztJQUNILE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBRTdCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNqQixhQUFhO1FBQ2IsNkZBQTZGO0lBQy9GLENBQUMsQ0FBQyxDQUFBO0lBRUYsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2QsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFBIn0=