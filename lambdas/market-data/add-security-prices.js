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
const repository_1 = __importDefault(require("@tradingpost/common/market-data/repository"));
const iex_1 = __importDefault(require("@tradingpost/common/iex"));
const luxon_1 = require("luxon");
const market_trading_hours_1 = __importDefault(require("@tradingpost/common/market-data/market-trading-hours"));
const pg_promise_1 = __importDefault(require("pg-promise"));
const utils_1 = require("./utils");
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
        yield pgClient.connect();
    }
    const iexConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("iex");
    const iex = new iex_1.default(iexConfiguration.key);
    const repository = new repository_1.default(pgClient, pgp);
    const marketService = new market_trading_hours_1.default(repository);
    try {
        yield start(marketService, repository, iex);
    }
    catch (e) {
        console.error(e);
        throw e;
    }
});
const start = (marketService, repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const marketIsOpen = yield marketService.isOpen();
    if (!marketIsOpen)
        return;
    const securities = yield repository.getUsExchangedListSecuritiesWithPricing();
    const securityGroups = (0, utils_1.buildGroups)(securities);
    const securitiesMap = {};
    securities.forEach((sec) => securitiesMap[sec.symbol] = sec);
    const currentTime = luxon_1.DateTime.now().setZone("America/New_York").set({ second: 0, millisecond: 0 }).toJSDate();
    for (let i = 0; i < securityGroups.length; i++) {
        let securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);
        const response = yield iex.bulk(symbols, ["quote"]);
        let securityPrices = [];
        securityGroup.forEach(sec => {
            const { symbol, id } = sec;
            if (response[symbol] === undefined || response[symbol] === null) {
                const s = securitiesMap[symbol];
                if (s.latestPrice === undefined || s.latestPrice === null)
                    return;
                securityPrices.push({
                    price: s.latestPrice,
                    high: s.latestHigh,
                    low: s.latestLow,
                    open: s.latestOpen,
                    securityId: id,
                    time: currentTime
                });
                return;
            }
            const quote = response[symbol].quote;
            if (quote.latestPrice === undefined || quote.latestPrice === null) {
                const s = securitiesMap[symbol];
                if (s.latestPrice === undefined || s.latestPrice === null)
                    return;
                securityPrices.push({
                    price: s.latestPrice,
                    open: s.latestOpen,
                    low: s.latestLow,
                    high: s.latestHigh,
                    securityId: id,
                    time: currentTime
                });
                return;
            }
            securityPrices.push({
                price: quote.latestPrice,
                high: quote.high ? quote.high : quote.latestPrice,
                low: quote.low ? quote.low : quote.latestPrice,
                open: quote.open ? quote.open : quote.open,
                securityId: id,
                time: currentTime
            });
        });
        yield repository.addSecuritiesPrices(securityPrices);
    }
});
// Pricing Charge
// Total Securities W/Out OTC : 11,847
// Total Securities W/ OTC: 26,746
// Per Day Charge = 390 * 26746 = 10,430,940
// Per Month = 219,049,740
// Per Month w/out OTC min-min = 11,847 * 390 = 4,620,330 * 21 = 97,026,930
module.exports.run = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
});
