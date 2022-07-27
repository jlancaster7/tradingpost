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
const repository_1 = __importDefault(require("../brokerage/repository"));
const index_1 = require("../configuration/index");
const pg_promise_1 = __importDefault(require("pg-promise"));
const index_2 = require("../brokerage/finicity/index");
const index_3 = __importDefault(require("../finicity/index"));
const transformer_1 = require("../brokerage/finicity/transformer");
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
    const finicity = new index_3.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    yield finicity.init();
    const repository = new repository_1.default(pgClient, pgp);
    const finicityService = new index_2.FinicityService(finicity, repository, new transformer_1.FinicityTransformer({
        getFinicityInstitutions() {
            throw new Error("Method Not Implemented");
        },
        getSecuritiesWithIssue() {
            throw new Error("Method Not Implemented");
        },
        getTradingPostAccountsWithFinicityNumber(userId) {
            throw new Error("Method Not Implemented");
        },
    }));
    const finicityUserUrl = yield finicityService.generateBrokerageAuthenticationLink("8e787902-f0e9-42aa-a8d8-18e5d7a1a34d");
    console.log(finicityUserUrl);
}))();
