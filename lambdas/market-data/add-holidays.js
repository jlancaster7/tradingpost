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
const iex_1 = __importDefault(require("@tradingpost/common/iex"));
const luxon_1 = require("luxon");
const repository_1 = require("../../services/market-data/repository");
const pg_1 = require("pg");
const configuration_1 = require("@tradingpost/common/configuration");
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ssmClient = new AWS.SSM();
const configuration = new configuration_1.Configuration(ssmClient);
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield configuration.fromSSM("/production/postgres");
    const iexConfiguration = yield configuration.fromSSM("/production/iex");
    const iex = new iex_1.default(iexConfiguration['key']);
    const pgClient = new pg_1.Client({
        host: postgresConfiguration['host'],
        user: postgresConfiguration['user'],
        password: postgresConfiguration['password'],
        database: postgresConfiguration['database']
    });
    const repository = new repository_1.Repository(pgClient);
    yield start(pgClient, repository, iex);
    yield pgClient.end();
});
const start = (pgClient, repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const usExchanges = yield iex.getUsExchanges();
    const internationalExchanges = yield iex.getInternationalExchanges();
    let exchanges = [];
    usExchanges.forEach((exchange) => {
        exchanges.push({
            longName: exchange.longName,
            mic: exchange.mic,
            name: exchange.name,
            oatsId: exchange.oatsId,
            refId: exchange.refId,
            tapeId: exchange.tapeId,
            type: exchange.type
        });
    });
    internationalExchanges.forEach((exchange) => {
        exchanges.push({
            description: exchange.description,
            exchangeSuffix: exchange.exchangeSuffix,
            longName: exchange.description,
            mic: exchange.mic,
            name: exchange.exchange,
            region: exchange.region,
            segment: exchange.segment,
            segmentDescription: exchange.segmentDescription,
            suffix: exchange.suffix
        });
    });
    yield repository.addExchanges(exchanges);
    const nextIexHolidays = yield iex.getUSHolidayAndTradingDays("holiday", "next");
    const lastIexHolidays = yield iex.getUSHolidayAndTradingDays("holiday", "last");
    let holidays = [];
    const holidayFunc = (h) => {
        const isoDate = luxon_1.DateTime.fromISO(h.date);
        const settlementDate = h.settlementDate == null ? null : luxon_1.DateTime.fromISO(h.settlementDate).toJSDate();
        holidays.push({ date: isoDate.toJSDate(), settlementDate: settlementDate });
    };
    nextIexHolidays.forEach(holidayFunc);
    lastIexHolidays.forEach(holidayFunc);
    yield repository.addUsExchangeHolidays(holidays);
});
// Pricing Cost 1 / year = 1 credit
module.exports.run = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
});
