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
const configuration_1 = require("@tradingpost/common/configuration");
const repository_1 = require("../../services/market-data/repository");
const iex_1 = __importDefault(require("@tradingpost/common/iex"));
const luxon_1 = require("luxon");
const market_data_1 = __importDefault(require("../../services/market-data"));
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
    const marketService = new market_data_1.default(repository);
    try {
        yield start(marketService, repository, iex);
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        yield pgp.end();
    }
});
const start = (marketService, repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const open = luxon_1.DateTime.now().setZone("America/New_York").set({ hour: 9, minute: 29, second: 0, millisecond: 0 });
    const close = luxon_1.DateTime.now().setZone("America/New_York").set({ hour: 16, minute: 1, second: 0, millisecond: 0 });
    let d = luxon_1.DateTime.now().setZone("America/New_York").set({ second: 0, millisecond: 0 });
    if (d.toSeconds() >= close.toSeconds() || d.toSeconds() <= open.toSeconds())
        return;
    const isTradingDay = yield marketService.isTradingDay(d);
    if (!isTradingDay)
        return;
    const securities = yield repository.getUSExchangeListedSecurities();
    const securityGroups = buildGroups(securities);
    const currentTime = d.toJSDate();
    for (let i = 0; i < securityGroups.length; i++) {
        let securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);
        const response = yield iex.bulk(symbols, ["quote"]);
        let securityPrices = [];
        securityGroup.forEach(sec => {
            const { symbol, id } = sec;
            if (response[symbol] === undefined || response[symbol] === null)
                return;
            const quote = response[symbol].quote;
            if (quote.latestPrice === undefined || quote.latestPrice === null)
                return;
            securityPrices.push({ price: quote.latestPrice, securityId: id, time: currentTime });
        });
        yield repository.addSecuritiesPrices(securityPrices);
    }
});
const buildGroups = (securities, max = 100) => {
    let groups = [];
    let group = [];
    securities.forEach(sec => {
        group.push(sec);
        if (group.length === max) {
            groups.push(group);
            group = [];
        }
    });
    if (group.length > 0)
        groups.push(group);
    return groups;
};
// Pricing Charge
// Total Securities W/Out OTC : 11,847
// Total Securities W/ OTC: 26,746
// Per Day Charge = 390 * 26746 = 10,430,940
// Per Month = 219,049,740
// Per Month w/out OTC min-min = 11,847 * 390 = 4,620,330 * 21 = 97,026,930
module.exports.run = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
});
