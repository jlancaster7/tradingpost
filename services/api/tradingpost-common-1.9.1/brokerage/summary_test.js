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
const portfolio_summary_1 = require("./portfolio-summary");
const configuration_1 = require("../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const repository_1 = __importDefault(require("./repository"));
let pgClient;
let pgp;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!pgClient || !pgp) {
        const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        pgp = (0, pg_promise_1.default)({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
    }
    const repo = new repository_1.default(pgClient, pgp);
    const service = new portfolio_summary_1.PortfolioSummaryService(repo);
    const test = yield service.computeAccountGroupSummary('e96aea04-9a60-4832-9793-f790e60df8eb');
    console.log(test);
});
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV90ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3VtbWFyeV90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUJBQXNCO0FBQ3RCLDJEQUE4RDtBQUM5RCxvREFBaUQ7QUFDakQsNERBQXVEO0FBQ3ZELDhEQUFzQztBQUV0QyxJQUFJLFFBQXdCLENBQUM7QUFDN0IsSUFBSSxHQUFVLENBQUM7QUFFZixNQUFNLEdBQUcsR0FBRyxHQUFTLEVBQUU7SUFFbkIsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNuQixNQUFNLHFCQUFxQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0UsR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztRQUNwQixRQUFRLEdBQUcsR0FBRyxDQUFDO1lBQ1gsSUFBSSxFQUFFLHFCQUFxQixDQUFDLElBQUk7WUFDaEMsSUFBSSxFQUFFLHFCQUFxQixDQUFDLElBQUk7WUFDaEMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7WUFDeEMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7U0FDM0MsQ0FBQyxDQUFBO0tBQ0w7SUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksMkNBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsMEJBQTBCLENBQUMsc0NBQXNDLENBQUMsQ0FBQztJQUU5RixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLENBQUMsQ0FBQSxDQUFBO0FBRUQsR0FBRyxFQUFFLENBQUMifQ==