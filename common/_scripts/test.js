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
const portfolio_summary_1 = require("../brokerage/portfolio-summary");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const pgCfg = yield index_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
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
    // console.log("Starting...")
    // const tpAccounts = await repo.getTradingPostBrokerageAccounts(tpUserId)
    //
    // const brokerageService = new BrokerageService({"finicity": finicityService}, repo, portfolioSummaryService);
    // for (let i = 0; i < tpAccounts.length; i++) {
    //     const acc = tpAccounts[i];
    //     const acctHoldingHistory = await brokerageService.computeHoldingsHistory(acc.id);
    //     await repo.upsertTradingPostHistoricalHoldings(acctHoldingHistory);
    // }
    //
    // console.log("finished")
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBcUQ7QUFDckQsNERBQW1DO0FBQ25DLDhEQUF5QztBQUN6QyxxRUFBb0Q7QUFDcEQseUVBQWdEO0FBQ2hELG9GQUFvRTtBQUVwRSxzRUFBdUU7QUFHdkUsQ0FBQyxHQUFTLEVBQUU7SUFDUixNQUFNLEtBQUssR0FBRyxNQUFNLHFCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRTdELE1BQU0sR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtRQUNoQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7UUFDeEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO0tBQzNCLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBRXhCLE1BQU0sV0FBVyxHQUFHLE1BQU0scUJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxlQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUVyQixNQUFNLFFBQVEsR0FBRyxzQ0FBc0MsQ0FBQztJQUN4RCxNQUFNLElBQUksR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSwyQ0FBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVsRSxNQUFNLGNBQWMsR0FBRyxJQUFJLHFCQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JELE1BQU0sZUFBZSxHQUFHLElBQUksa0JBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRTVFLDZCQUE2QjtJQUM3QiwwRUFBMEU7SUFDMUUsRUFBRTtJQUNGLCtHQUErRztJQUMvRyxnREFBZ0Q7SUFDaEQsaUNBQWlDO0lBQ2pDLHdGQUF3RjtJQUN4RiwwRUFBMEU7SUFDMUUsSUFBSTtJQUNKLEVBQUU7SUFDRiwwQkFBMEI7QUFDOUIsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFBIn0=