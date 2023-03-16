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
const service_1 = require("./service");
const pg_promise_1 = __importDefault(require("pg-promise"));
const post_prepper_1 = __importDefault(require("../../post-prepper"));
const elastic_1 = __importDefault(require("../../elastic"));
const elasticsearch_1 = require("@elastic/elasticsearch");
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
    const youtubeConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("youtube");
    const youtube = (0, service_1.DefaultYoutube)(youtubeConfiguration, pgClient, pgp, elasticService);
    yield youtube.importUsersById(['https://www.youtube.com/channel/UC0JCwH1VkBbIZOAIPufdgyQ']);
});
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5faW1wb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRtaW5faW1wb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUJBQXNCO0FBQ3RCLHVEQUFrRDtBQUNsRCx1Q0FBMkM7QUFHM0MsNERBQW1DO0FBRW5DLHNFQUE2QztBQUM3Qyw0REFBMkM7QUFDM0MsMERBQStEO0FBRS9ELE1BQU0sR0FBRyxHQUFHLEdBQVMsRUFBRTtJQUNuQixNQUFNLHFCQUFxQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0UsTUFBTSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtRQUN4QyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtLQUMzQyxDQUFDLENBQUM7SUFFSCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN4QixNQUFNLG9CQUFvQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0UsTUFBTSxhQUFhLEdBQUcsSUFBSSxzQkFBYSxDQUFDO1FBQ3BDLEtBQUssRUFBRTtZQUNILEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxPQUFpQjtTQUM3QztRQUNELElBQUksRUFBRTtZQUNGLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxNQUFnQjtTQUNoRDtRQUNELFVBQVUsRUFBRSxDQUFDO0tBQ2hCLENBQUMsQ0FBQTtJQUVGLE1BQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDO0lBQ3ZDLE1BQU0sY0FBYyxHQUFHLElBQUksaUJBQWMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFcEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxzQkFBVyxFQUFFLENBQUM7SUFFdEMsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sT0FBTyxHQUFHLElBQUEsd0JBQWMsRUFBQyxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRXBGLE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLDBEQUEwRCxDQUFDLENBQUMsQ0FBQTtBQUMvRixDQUFDLENBQUEsQ0FBQTtBQUNELEdBQUcsRUFBRSxDQUFDIn0=