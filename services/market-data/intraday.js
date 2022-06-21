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
const pg_1 = require("pg");
const configuration_1 = require("@tradingpost/common/configuration");
const repository_1 = require("./repository");
const luxon_1 = require("luxon");
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
        database: postgresConfiguration['database'],
        port: 5432,
    });
    yield pgClient.connect();
    const repository = new repository_1.Repository(pgClient);
    const securities = yield repository.getSecurities();
    let groups = [];
    let group = [];
    let securitiesMap = {};
    for (const security of securities) {
        securitiesMap[security.symbol] = security;
        group.push(security);
        if (group.length === 100) {
            groups.push(group);
            group = [];
        }
    }
    if (group.length > 0) {
        groups.push(group);
    }
    let cnt = 0;
    let len = groups.length;
    for (const group of groups) {
        cnt = cnt + 1;
        console.log(`Processing ${cnt}/${groups.length}`);
        let symbols = group.map((g) => g.symbol);
        try {
            const symbolsWithPrices = yield iex.bulk(symbols, ['chart'], {
                chartCloseOnly: true,
                range: 'max',
                chartLast: 6
            });
            const securityPrices = [];
            Object.keys(symbolsWithPrices).forEach(symbol => {
                const prices = symbolsWithPrices[symbol]['chart'];
                const security = securitiesMap[symbol];
                if (!security)
                    return;
                if (!prices)
                    return;
                prices.forEach((p) => {
                    if (p.date === null)
                        return;
                    const dt = luxon_1.DateTime.fromISO(p.date).setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    });
                    if (p.close === null)
                        return;
                    securityPrices.push({
                        price: p.close,
                        securityId: security.id,
                        time: dt.toJSDate()
                    });
                });
            });
            yield repository.upsertSecuritiesPrices(securityPrices);
        }
        catch (e) {
            console.error(e);
        }
    }
    yield pgClient.end();
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
}))();
