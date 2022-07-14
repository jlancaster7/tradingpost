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
const iex_1 = __importDefault(require("@tradingpost/common/iex"));
const luxon_1 = require("luxon");
const repository_1 = require("../../services/market-data/repository");
const configuration_1 = require("@tradingpost/common/configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
let pgClient;
let pgp;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!pgClient || !pgp) {
        const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        pgp = (0, pg_promise_1.default)({});
        pgClient = pgp({
            host: postgresConfiguration['host'],
            user: postgresConfiguration['user'],
            password: postgresConfiguration['password'],
            database: postgresConfiguration['database']
        });
    }
    const iexConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("iex");
    const iex = new iex_1.default(iexConfiguration.key);
    yield pgClient.connect();
    const repository = new repository_1.Repository(pgClient, pgp);
    try {
        yield start(repository, iex);
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        yield pgp.end();
    }
});
const start = (repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const nextIexHolidays = yield iex.getUSHolidayAndTradingDays("holiday", "next", 100000);
    const lastIexHolidays = yield iex.getUSHolidayAndTradingDays("holiday", "last", 100000);
    let holidays = [];
    const holidayFunc = (h) => {
        const isoDate = luxon_1.DateTime.fromISO(h.date);
        const settlementDate = h.settlementDate == null ? null : luxon_1.DateTime.fromISO(h.settlementDate);
        holidays.push({ date: isoDate.toJSDate(), settlementDate: (settlementDate === null || settlementDate === void 0 ? void 0 : settlementDate.toJSDate()) || null });
    };
    nextIexHolidays.forEach(holidayFunc);
    lastIexHolidays.forEach(holidayFunc);
    try {
        yield repository.addUsExchangeHolidays(holidays);
    }
    catch (e) {
        console.error(e);
    }
});
// Pricing Cost 1 / year = 1 credit
module.exports.run = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
});
