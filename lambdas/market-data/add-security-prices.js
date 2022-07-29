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
    let currentTime = luxon_1.DateTime.now().setZone("America/New_York");
    const marketIsOpen = yield marketService.isTradingDay(currentTime);
    if (!marketIsOpen)
        return;
    const securities = yield repository.getUsExchangedListSecuritiesWithPricing();
    const securityGroups = (0, utils_1.buildGroups)(securities, 100);
    let securityPrices = [];
    for (let i = 0; i < securityGroups.length; i++) {
        let securityGroup = securityGroups[i];
        const symbols = securityGroup.map(sec => sec.symbol);
        try {
            const response = yield iex.bulk(symbols, ["intraday-prices"], {
                chartIEXWhenNull: true,
                chartLast: 1
            });
            let prices = yield perform(securityGroup, response, repository);
            securityPrices = [...securityPrices, ...prices];
        }
        catch (err) {
            for (let i = 0; i < securityGroup.length; i++) {
                const sec = securityGroup[i];
                try {
                    const response = yield iex.bulk([sec.symbol], ["intraday-prices"], {
                        chartIEXWhenNull: true,
                        chartLast: 1
                    });
                    let prices = yield perform([sec], response, repository);
                    securityPrices = [...securityPrices, ...prices];
                }
                catch (err) {
                    console.log(sec.symbol);
                    console.error(err);
                }
            }
        }
    }
    yield repository.addSecuritiesPrices(securityPrices);
});
const perform = (securityGroup, response, repository) => __awaiter(void 0, void 0, void 0, function* () {
    let securityPrices = [];
    securityGroup.forEach(sec => {
        const { symbol, id } = sec;
        if (response[symbol] === undefined || response[symbol] === null)
            return;
        const intradayPrices = response[symbol]['intraday-prices'];
        if (intradayPrices.length <= 0)
            return;
        const lp = intradayPrices[0];
        const time = luxon_1.DateTime.fromFormat(`${lp.date} ${lp.minute}`, "yyyy-LL-dd HH:mm").setZone("America/New_York");
        // If no avail price, default to what was previous available for this security
        securityPrices.push({
            price: lp.close ? lp.close : sec.latestPrice,
            high: lp.high ? lp.high : sec.latestHigh,
            low: lp.low ? lp.low : sec.latestLow,
            open: lp.open ? lp.open : sec.latestOpen,
            securityId: id,
            time: time.toJSDate()
        });
    });
    return securityPrices;
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
