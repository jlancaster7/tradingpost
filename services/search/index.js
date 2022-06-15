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
const elasticsearch_1 = require("@elastic/elasticsearch");
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const elasticCloudId = process.env.ELASTIC_CLOUD_ID || '';
const elasticApiKey = process.env.ELASTIC_API_KEY || '';
const client = new elasticsearch_1.Client({
    cloud: {
        id: elasticCloudId
    },
    auth: {
        apiKey: elasticApiKey
    }
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const indexName = "tradingpost-search";
    // const esIndexSettings JSON.parse(fs.readFileSync('./index-settings.json', 'utf8'))
    try {
        yield client.indices.delete({ index: indexName });
    }
    catch (e) {
        console.error();
    }
    const esIndexSchema = JSON.parse(fs_1.default.readFileSync('./schema.json', 'utf8'));
    const esData = JSON.parse(fs_1.default.readFileSync('./test-data.json', 'utf8'));
    const response = yield client.indices.create({
        index: indexName,
        mappings: esIndexSchema.mappings,
    });
    console.log("Index Created....");
    console.log("Indexing Data....");
    // for (let i = 0; i < esData.length; i++) {
    //     await client.index({
    //         index: indexName,
    //         document: esData[i]
    //     });
    // }
    // await client.indices.refresh({index: indexName});
    console.log(`ElasticSearch Index(${indexName}) Built With New Data`);
});
run().catch(err => {
    console.error(err);
});
