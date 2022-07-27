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
