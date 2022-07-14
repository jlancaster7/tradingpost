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
const repository_1 = require("../../services/market-data/repository");
const luxon_1 = require("luxon");
const configuration_1 = require("@tradingpost/common/configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const deep_object_diff_1 = require("deep-object-diff");
// Pricing Charge
// AM
// OTC Symbols = 100
// Stock Symbols = 1
// Company(10) & Logo(1) = N/A
// 1 Per Request = 3 credits
// Per Day = 100 + 1 + 3 + Variable = 104 Credits / Day
//
// PM
// Previous =  2 / symbol
// Stats = 5 / symbol
// Quote = 1 / symbol
// Total For All Securities = 26747 * 8
// 1 Per Request = 268
// Per Day = (26748 * 8) + 268 = 214,244 / Day * 21
// Per Month = 4,501,308
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
    const iexConfiguration = yield configuration_1.DefaultConfig.fromSSM("iex");
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
    const now = luxon_1.DateTime.now().setZone("America/New_York");
    if (now.hour == 16)
        yield ingestEveningSecuritiesInformation(repository, iex);
    if (now.hour == 8) {
        if (now.weekday === 5) {
            yield updateSecurities(repository, iex);
            return;
        }
        yield ingestMorningSecuritiesInformation(repository, iex);
    }
});
const updateSecurities = (repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const securities = yield repository.getIexSecurities();
    let securitiesMap = buildSecuritiesMap(securities);
    let securityGroups = buildGroups(securities, 100);
    let updateSymbols = [];
    for (let i = 0; i < securityGroups.length; i++) {
        const securities = securityGroups[i];
        const symbols = securities.map(sec => sec.symbol);
        const iexResponse = yield iex.bulk(symbols, ["company", "logo"]);
        let newSecurities = [];
        let newIexSecurities = [];
        let updateIexSecurities = [];
        symbols.forEach((symbol) => {
            const sec = iexResponse[symbol];
            if (sec === undefined || sec === null)
                return;
            let logo = sec.logo;
            let company = sec.company;
            let newSec = {
                address: company.address || null,
                address2: company.address2 || null,
                ceo: company.CEO || null,
                companyName: company.companyName,
                country: company.country || null,
                description: company.description || null,
                employees: company.employees !== null ? company.employees.toString() : null,
                exchange: company.exchange || null,
                industry: company.industry || null,
                issueType: company.issueType || null,
                logoUrl: logo.url || null,
                phone: company.phone || null,
                primarySicCode: company.primarySicCode !== null ? company.primarySicCode.toString() : null,
                sector: company.sector || null,
                securityName: company.securityName || null,
                state: company.state || null,
                symbol: company.symbol,
                tags: company.tags || null,
                website: company.website || null,
                zip: company.zip || null
            };
            let newIexSecurity = Object.assign(Object.assign({}, newSec), { validated: false });
            // Couldn't find anything, lets insert it!
            const curSec = securitiesMap[symbol];
            if (curSec === undefined || curSec === null) {
                newSecurities.push(newSec);
                newIexSecurities.push(newIexSecurity);
                updateSymbols.push(symbol);
                return;
            }
            newIexSecurity.validated = true;
            curSec.validated = true;
            // Compare Objects...
            if (Object.keys((0, deep_object_diff_1.diff)(curSec, newIexSecurity)).length === 0)
                return;
            newIexSecurity.validated = false;
            updateIexSecurities.push(newIexSecurity);
            updateSymbols.push(newIexSecurity.symbol);
        });
        yield repository.addIexSecurities(newIexSecurities);
        yield repository.addSecurities(newSecurities);
        yield repository.updateIexSecurities(updateIexSecurities);
    }
    // TODO: Publish message to Teams
    console.log(`${updateSymbols.length} New/Updated Securities. Security Symbols List: ${updateSymbols.join(",")}`);
});
const ingestEveningSecuritiesInformation = (repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const securities = yield repository.getSecurities();
    let securitiesMap = buildSecuritiesMap(securities);
    let securityGroups = buildGroups(securities, 100);
    for (let i = 0; i < securityGroups.length; i++) {
        const securities = securityGroups[i];
        const symbols = securities.map(sec => sec.symbol);
        const iexResponse = yield iex.bulk(symbols, ["previous", "stats", "quote"]);
        let securitiesInformation = [];
        let securityPrices = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (iexResponse[symbol] === undefined || iexResponse === null)
                continue;
            const existingSecurity = securitiesMap[symbol];
            if (existingSecurity === undefined || existingSecurity === null)
                continue;
            let quote = iexResponse[symbol].quote;
            let stats = iexResponse[symbol].stats;
            let previous = iexResponse[symbol].previous || {};
            if (quote.latestPrice !== null)
                // Ingest end of day price & all stats stuff....
                securityPrices.push({
                    price: quote.latestPrice,
                    securityId: existingSecurity.id,
                    time: luxon_1.DateTime.now().setZone('America/New_York').set({ hour: 16, minute: 0, second: 0 }).toJSDate()
                });
            securitiesInformation.push({
                avg10Volume: stats.avg10Volume,
                avg30Volume: stats.avg30Volume,
                avgTotalVolume: quote.avgTotalVolume,
                beta: stats.beta,
                calculationPrice: quote.calculationPrice,
                change: quote.change,
                changePercent: quote.changePercent,
                close: quote.close,
                currency: quote.currency,
                day200MovingAvg: stats.day200MovingAvg,
                day30ChangePercent: stats.day30ChangePercent,
                day50MovingAvg: stats.day50MovingAvg,
                day5ChangePercent: stats.day5ChangePercent,
                delayedPrice: quote.delayedPrice,
                delayedPriceTime: quote.delayedPriceTime,
                dividendYield: stats.dividendYield,
                employees: stats.employees,
                exDividendDate: stats.exDividendDate,
                extendedChange: quote.extendedChange,
                extendedChangePercent: quote.extendedChangePercent,
                extendedPrice: quote.extendedPrice,
                extendedPriceTime: quote.extendedPriceTime,
                float: stats.float,
                fullyAdjustedClose: previous.fClose || null,
                fullyAdjustedLow: previous.fLow || null,
                fullyAdjustedOpen: previous.fOpen || null,
                fullyAdjustedVolume: previous.fVolume || null,
                high: quote.high,
                label: previous.label || null,
                lastTradeTime: quote.lastTradeTime,
                low: quote.low,
                marketCap: quote.marketCap,
                marketChangeOverTime: previous.marketChangeOverTime || null,
                maxChangePercent: stats.maxChangePercent,
                month1ChangePercent: stats.month1ChangePercent,
                month3ChangePercent: stats.month3ChangePercent,
                month6ChangePercent: stats.month6ChangePercent,
                nextDividendDate: stats.nextDividendDate,
                nextEarningsDate: stats.nextEarningsDate,
                oddLotDelayedPrice: quote.oddLotDelayedPrice,
                oddLotDelayedPriceTime: quote.oddLotDelayedPriceTime,
                open: quote.open,
                peRatio: quote.peRatio,
                previousClose: quote.previousClose,
                previousVolume: quote.previousVolume,
                securityId: existingSecurity.id,
                sharesOutstanding: stats.sharesOutstanding,
                ttmDividendRate: stats.ttmDividendRate,
                ttmEps: stats.ttmEPS,
                unadjustedClose: previous.uClose || null,
                unadjustedLow: previous.uLow || null,
                unadjustedOpen: previous.uOpen || null,
                unadjustedVolume: previous.uVolume || null,
                volume: previous.volume || null,
                week52Change: stats.week52change,
                week52High: stats.week52high,
                week52HighSplitAdjustOnly: stats.week52highSplitAdjustOnly,
                week52Low: stats.week52low,
                week52LowSplitAdjustOnly: stats.week52lowSplitAdjustOnly,
                year1ChangePercent: stats.year1ChangePercent,
                year2ChangePercent: stats.year2ChangePercent,
                year5ChangePercent: stats.year5ChangePercent,
                ytdChange: quote.ytdChange,
                ytdChangePercent: stats.ytdChangePercent
            });
        }
        yield repository.upsertSecuritiesPrices(securityPrices);
        yield repository.upsertSecuritiesInformation(securitiesInformation);
    }
});
const ingestMorningSecuritiesInformation = (repository, iex) => __awaiter(void 0, void 0, void 0, function* () {
    const currentSecurities = yield repository.getIexSecurities();
    const currentSecuritiesMap = buildSecuritiesMap(currentSecurities);
    const possiblyNewSecurities = yield iex.getIexSymbols();
    const possiblyNewOTCSymbols = yield iex.getOtcSymbols();
    let newSymbols = [];
    possiblyNewSecurities.forEach((n) => {
        const cs = currentSecuritiesMap[n.symbol];
        if (cs === undefined || cs === null)
            newSymbols.push(n.symbol);
    });
    possiblyNewOTCSymbols.forEach((n) => {
        const cs = currentSecuritiesMap[n.symbol];
        if (cs === undefined || cs === null)
            newSymbols.push(n.symbol);
    });
    // These are companies I need to ingest company info, logo, and as a new security
    const newSymbolsGroups = buildGroups(newSymbols);
    let newSymbolsCollection = [];
    for (let i = 0; i < newSymbolsGroups.length; i++) {
        let newSymbols = newSymbolsGroups[i];
        const response = yield iex.bulk(newSymbols, ["company", "logo"]);
        let newSecurities = [];
        let newIexSecurities = [];
        newSymbols.forEach(symbol => {
            const res = response[symbol];
            if (res === undefined || res === null)
                return;
            const company = res.company;
            const logo = res.logo;
            if (company.companyName === null)
                return;
            let newSec = {
                address: company.address || null,
                address2: company.address2 || null,
                ceo: company.CEO || null,
                companyName: company.companyName,
                country: company.country || null,
                description: company.description || null,
                employees: company.employees !== null ? company.employees.toString() : null,
                exchange: company.exchange || null,
                industry: company.industry || null,
                issueType: company.issueType || null,
                logoUrl: logo.url || null,
                phone: company.phone || null,
                primarySicCode: company.primarySicCode !== null ? company.primarySicCode.toString() : null,
                sector: company.sector || null,
                securityName: company.securityName || null,
                state: company.state || null,
                symbol: company.symbol,
                tags: company.tags || null,
                website: company.website || null,
                zip: company.zip || null
            };
            let newIexSec = Object.assign(Object.assign({}, newSec), { validated: false });
            newSecurities.push(newSec);
            newIexSecurities.push(newIexSec);
            newSymbolsCollection.push(newSec.symbol);
        });
        yield repository.addSecurities(newSecurities);
        yield repository.addIexSecurities(newIexSecurities);
    }
    // TODO: Publish message to Teams
    console.log(`${newSymbolsCollection.length} New Securities. Security Symbols List: ${newSymbolsCollection.join(",")}`);
});
const buildSecuritiesMap = (securities) => {
    let m = {};
    securities.forEach(sec => m[sec.symbol] = sec);
    return m;
};
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
module.exports.run = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
});
