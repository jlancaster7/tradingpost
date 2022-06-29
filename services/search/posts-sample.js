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
const configuration_1 = require("@tradingpost/common/configuration");
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
    // Get Users Following IDs
    const response = yield elasticClient.search({
        index: indexName,
        query: {
            bool: {
                must: [
                    {
                        match: { "platform.displayName": "joshua" }
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
                platformCreatedAt: { order: "desc" }
            }
        ]
    });
    const { hits } = response.hits;
    console.log(hits);
}))();
