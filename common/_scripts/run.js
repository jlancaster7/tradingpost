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
const index_1 = require("../configuration/index");
const pg_promise_1 = __importDefault(require("pg-promise"));
const index_2 = __importDefault(require("../finicity/index"));
const finicity_1 = __importDefault(require("../brokerage/finicity"));
const repository_1 = __importDefault(require("../brokerage/repository"));
const transformer_1 = __importDefault(require("../brokerage/finicity/transformer"));
const service_1 = __importDefault(require("../brokerage/service"));
const portfolio_summary_1 = require("../brokerage/portfolio-summary");
const pg_1 = __importDefault(require("pg"));
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.INT8, (value) => {
    return parseInt(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT8, (value) => {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT4, (value) => {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.NUMERIC, (value) => {
    return parseFloat(value);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const pgCfg = yield index_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({
    // query(e: any) {
    //     console.log(e.query)
    // }
    });
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });
    yield pgClient.connect();
    const finicityCfg = yield index_1.DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new index_2.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    yield finicity.init();
    const tpUserId = "8e787902-f0e9-42aa-a8d8-18e5d7a1a34d";
    const repo = new repository_1.default(pgClient, pgp);
    const portfolioSummaryService = new portfolio_summary_1.PortfolioSummaryService(repo);
    const finTransformer = new transformer_1.default(repo);
    const finicityService = new finicity_1.default(finicity, repo, finTransformer);
    console.log("Starting...");
    const brokerageService = new service_1.default({ "finicity": finicityService }, repo, portfolioSummaryService);
    yield brokerageService.newlyAuthenticatedBrokerage(tpUserId, 'finicity');
    console.log("Finished");
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQXFEO0FBQ3JELDREQUFtQztBQUNuQyw4REFBeUM7QUFDekMscUVBQW9EO0FBQ3BELHlFQUFnRDtBQUNoRCxvRkFBb0U7QUFDcEUsbUVBQW9EO0FBQ3BELHNFQUF1RTtBQUN2RSw0Q0FBb0I7QUFFcEIsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDN0QsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUMvRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQztBQUVILFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQy9ELE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDaEUsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxDQUFDLEdBQVMsRUFBRTtJQUNSLE1BQU0sS0FBSyxHQUFHLE1BQU0scUJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFN0QsTUFBTSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDO0lBQ2xCLGtCQUFrQjtJQUNsQiwyQkFBMkI7SUFDM0IsSUFBSTtLQUNQLENBQUMsQ0FBQztJQUNILE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7UUFDaEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUN4QixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7SUFFeEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxxQkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRSxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO0lBRXJCLE1BQU0sUUFBUSxHQUFHLHNDQUFzQyxDQUFDO0lBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFM0MsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLDJDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxFLE1BQU0sY0FBYyxHQUFHLElBQUkscUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckQsTUFBTSxlQUFlLEdBQUcsSUFBSSxrQkFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMxQixNQUFNLGdCQUFnQixHQUFHLElBQUksaUJBQWdCLENBQUMsRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFDLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDNUcsTUFBTSxnQkFBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUMzQixDQUFDLENBQUEsQ0FBQyxFQUFFLENBQUEifQ==