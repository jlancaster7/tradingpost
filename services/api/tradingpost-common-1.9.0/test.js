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
const configuration_1 = require("./configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const pg_1 = __importDefault(require("pg"));
const repository_1 = __importDefault(require("./brokerage/repository"));
const robinhood_1 = require("./brokerage/robinhood");
const transformer_1 = __importDefault(require("./brokerage/robinhood/transformer"));
const portfolio_summary_1 = require("./brokerage/portfolio-summary");
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
let pgClient;
let pgp;
const run = (tokenFile) => __awaiter(void 0, void 0, void 0, function* () {
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
    const rhCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("robinhood");
    const repository = new repository_1.default(pgClient, pgp);
    const transformer = new transformer_1.default(repository);
    const portSummarty = new portfolio_summary_1.PortfolioSummaryService(repository);
    const robinhood = new robinhood_1.Service(rhCfg.clientId, rhCfg.scope, rhCfg.expiresIn, repository, transformer, portSummarty);
    const institution = yield repository.getInstitutionByName("Robinhood");
    if (!institution)
        throw new Error(" no robinhood institution");
    yield robinhood.positions("ea05f297-461f-49be-99b9-67ce9ad238c6");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBc0I7QUFDdEIsbURBQThDO0FBQzlDLDREQUF1RDtBQUN2RCw0Q0FBb0I7QUFDcEIsd0VBQWdEO0FBQ2hELHFEQUFrRTtBQUNsRSxvRkFBa0Y7QUFDbEYscUVBQXNFO0FBRXRFLFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQzdELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDL0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUMvRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQztBQUVILFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQ2hFLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxRQUF3QixDQUFDO0FBQzdCLElBQUksR0FBVSxDQUFDO0FBRWYsTUFBTSxHQUFHLEdBQUcsQ0FBTyxTQUFrQixFQUFFLEVBQUU7SUFDckMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNuQixNQUFNLHFCQUFxQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0UsR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztRQUNwQixRQUFRLEdBQUcsR0FBRyxDQUFDO1lBQ1gsSUFBSSxFQUFFLHFCQUFxQixDQUFDLElBQUk7WUFDaEMsSUFBSSxFQUFFLHFCQUFxQixDQUFDLElBQUk7WUFDaEMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7WUFDeEMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7U0FDM0MsQ0FBQyxDQUFBO0tBQ0w7SUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzlELE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsTUFBTSxXQUFXLEdBQUcsSUFBSSxxQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6RCxNQUFNLFlBQVksR0FBRyxJQUFJLDJDQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdELE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM1SCxNQUFNLFdBQVcsR0FBRyxNQUFNLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RSxJQUFJLENBQUMsV0FBVztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtJQUM5RCxNQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUN0RSxDQUFDLENBQUEsQ0FBQSJ9