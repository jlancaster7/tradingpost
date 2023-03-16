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
const configuration_1 = require("../../configuration");
const index_1 = __importDefault(require("./index"));
const repository_1 = __importDefault(require("../repository"));
const pg_promise_1 = __importDefault(require("pg-promise"));
const post_prepper_1 = __importDefault(require("../../post-prepper"));
const elastic_1 = __importDefault(require("../../elastic"));
const elasticsearch_1 = require("@elastic/elasticsearch");
const importList = ['bestanchorstocks'];
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    yield pgClient.connect();
    const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new elasticsearch_1.Client({
        cloud: {
            id: elasticConfiguration.cloudId
        },
        auth: {
            apiKey: elasticConfiguration.apiKey
        },
        maxRetries: 5,
    });
    const indexName = "tradingpost-search";
    const elasticService = new elastic_1.default(elasticClient, indexName);
    const postPrepper = new post_prepper_1.default();
    const repo = new repository_1.default(pgClient, pgp);
    const substack = new index_1.default(repo, postPrepper);
    for (let d of importList) {
        yield substack.adminImportUsers(d);
    }
    console.log('finished importing new substacks');
});
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5faW1wb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRtaW5faW1wb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUJBQXNCO0FBQ3RCLHVEQUFrRDtBQUNsRCxvREFBOEI7QUFDOUIsK0RBQXNDO0FBRXRDLDREQUFtQztBQUVuQyxzRUFBNkM7QUFDN0MsNERBQTJDO0FBQzNDLDBEQUErRDtBQUUvRCxNQUFNLFVBQVUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7QUFJdkMsTUFBTSxHQUFHLEdBQUcsR0FBUyxFQUFFO0lBQ25CLE1BQU0scUJBQXFCLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3RSxNQUFNLEdBQUcsR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1FBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1FBQ2hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1FBQ3hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO0tBQzNDLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3hCLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzRSxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFhLENBQUM7UUFDcEMsS0FBSyxFQUFFO1lBQ0gsRUFBRSxFQUFFLG9CQUFvQixDQUFDLE9BQWlCO1NBQzdDO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsTUFBTSxFQUFFLG9CQUFvQixDQUFDLE1BQWdCO1NBQ2hEO1FBQ0QsVUFBVSxFQUFFLENBQUM7S0FDaEIsQ0FBQyxDQUFBO0lBRUYsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUM7SUFDdkMsTUFBTSxjQUFjLEdBQUcsSUFBSSxpQkFBYyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUVwRSxNQUFNLFdBQVcsR0FBRyxJQUFJLHNCQUFXLEVBQUUsQ0FBQztJQUV0QyxNQUFNLElBQUksR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sUUFBUSxHQUFHLElBQUksZUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUNoRCxLQUFLLElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRTtRQUN0QixNQUFNLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNyQztJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQTtBQUNuRCxDQUFDLENBQUEsQ0FBQTtBQUNELEdBQUcsRUFBRSxDQUFDIn0=