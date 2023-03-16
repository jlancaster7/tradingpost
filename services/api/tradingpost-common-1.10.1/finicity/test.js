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
process.env.CONFIGURATION_ENV = 'production';
const configuration_1 = require("../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const index_1 = __importDefault(require("./index"));
const repository_1 = __importDefault(require("../brokerage/repository"));
const finicity_1 = __importDefault(require("../brokerage/finicity"));
const transformer_1 = __importDefault(require("../brokerage/finicity/transformer"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    let pgClient;
    let pgp;
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    pgp = (0, pg_promise_1.default)({});
    pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    yield pgClient.connect();
    const repo = new repository_1.default(pgClient, pgp);
    const transformer = new transformer_1.default(repo);
    const finicityCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new index_1.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    yield finicity.init();
    const finicityService = new finicity_1.default(finicity, repo, transformer);
    console.log('test');
    console.log(yield finicityService.generateBrokerageAuthenticationLink('e96aea04-9a60-4832-9793-f790e60df8eb'));
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLFlBQVksQ0FBQTtBQUM1QyxvREFBaUQ7QUFDakQsNERBQXlEO0FBQ3pELG9EQUErQjtBQUMvQix5RUFBaUQ7QUFDakQscUVBQW9EO0FBQ3BELG9GQUFvRTtBQUVwRSxDQUFDLEdBQVEsRUFBRTtJQUNQLElBQUksUUFBd0IsQ0FBQztJQUM3QixJQUFJLEdBQVUsQ0FBQztJQUNmLE1BQU0scUJBQXFCLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3RSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDWCxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtRQUN4QyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtLQUMzQyxDQUFDLENBQUM7SUFDSCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sV0FBVyxHQUFHLElBQUkscUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsTUFBTSxXQUFXLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRSxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO0lBRXJCLE1BQU0sZUFBZSxHQUFHLElBQUksa0JBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBRXhFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLGVBQWUsQ0FBQyxtQ0FBbUMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUE7QUFFbEgsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFBIn0=