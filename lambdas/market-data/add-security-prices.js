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
const configuration_1 = require("@tradingpost/common/configuration");
const pg_1 = require("pg");
const repository_1 = require("../../services/market-data/repository");
const iex_1 = __importDefault(require("@tradingpost/common/iex"));
const luxon_1 = require("luxon");
const market_data_1 = __importDefault(require("../../services/market-data"));
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ssmClient = new AWS.SSM();
const configuration = new configuration_1.Configuration(ssmClient);
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield configuration.fromSSM("/production/postgres");
    const pgClient = new pg_1.Client({
        host: postgresConfiguration['host'],
        user: postgresConfiguration['user'],
        password: postgresConfiguration['password'],
        database: postgresConfiguration['database'],
        port: 5432,
    });
    const iexConfiguration = yield configuration.fromSSM("/production/iex");
    const iex = new iex_1.default(iexConfiguration.key);
    yield pgClient.connect();
    const repository = new repository_1.Repository(pgClient);
    const marketService = new market_data_1.default(repository);
    yield start(pgClient, marketService, repository, iex);
    yield pgClient.end();
});
const start = (pgClient, marketService, repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const isMarketOpen = yield marketService.isMarketOpen();
    if (!isMarketOpen)
        return;
    const securities = yield repository.getUSExchangeListedSecurities();
    const securityGroups = buildGroups(securities);
    // TODO: Get securities with latest price available, if iex latest price is null, then default to last price avail
    // TODO: Update so that we can run multiple at the same time....
    const currentTime = luxon_1.DateTime.now().set({ second: 0, millisecond: 0 }).toJSDate();
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
