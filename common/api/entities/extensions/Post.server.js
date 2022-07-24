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
let postsPerPage = 20;
exports.default = (0, _1.ensureServerExtensions)({
    feed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.body.page)
            throw new EntityApiBase_1.PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        if (page * postsPerPage + 20 > 10000)
            return [];
        const indexName = "tradingpost-search";
        //  const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
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
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
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
        return hits;
    })
});
