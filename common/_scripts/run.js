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
process.env.CONFIGURATION_ENV = "production";
process.env.FINICITY_CALLBACK_URL = "ndad";
const index_1 = require("../configuration/index");
const pg_promise_1 = __importDefault(require("pg-promise"));
const index_2 = __importDefault(require("../finicity/index"));
const finicity_1 = __importDefault(require("../brokerage/finicity"));
const repository_1 = __importDefault(require("../brokerage/repository"));
const transformer_1 = __importDefault(require("../brokerage/finicity/transformer"));
const portfolio_summary_1 = require("../brokerage/portfolio-summary");
const luxon_1 = require("luxon");
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
    const dt = luxon_1.DateTime.now();
    const dt24Months = dt.minus({ month: 24 });
    console.log("Cur: ", dt.toUnixInteger());
    console.log("End: ", dt24Months.toUnixInteger());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUE7QUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUE7QUFJMUMsa0RBQXVEO0FBQ3ZELDREQUFtQztBQUNuQyw4REFBeUM7QUFDekMscUVBQW9EO0FBQ3BELHlFQUFnRDtBQUNoRCxvRkFBcUU7QUFFckUsc0VBQXlFO0FBQ3pFLGlDQUFpQztBQUVqQyxDQUFDLEdBQVMsRUFBRTtJQUNSLE1BQU0sS0FBSyxHQUFHLE1BQU0scUJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFN0QsTUFBTSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7UUFDaEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUN4QixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7SUFFeEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxxQkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRSxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO0lBRXJCLE1BQU0sUUFBUSxHQUFHLHNDQUFzQyxDQUFDO0lBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFM0MsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLDJDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxFLE1BQU0sY0FBYyxHQUFHLElBQUkscUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckQsTUFBTSxlQUFlLEdBQUcsSUFBSSxrQkFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDNUUsTUFBTSxFQUFFLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUE7SUFDaEQsNkJBQTZCO0lBQzdCLDBFQUEwRTtJQUMxRSxFQUFFO0lBQ0YsK0dBQStHO0lBQy9HLGdEQUFnRDtJQUNoRCxpQ0FBaUM7SUFDakMsd0ZBQXdGO0lBQ3hGLDBFQUEwRTtJQUMxRSxJQUFJO0lBQ0osRUFBRTtJQUNGLDBCQUEwQjtBQUM5QixDQUFDLENBQUEsQ0FBQyxFQUFFLENBQUEifQ==