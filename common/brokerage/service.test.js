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
const service_1 = __importDefault(require("./service"));
const luxon_1 = require("luxon");
const interfaces_1 = require("./interfaces");
const portfolio_summary_1 = require("./portfolio-summary");
const Securities = [
    { id: 20, symbol: 'PYPL', name: 'Paypal Holdings Inc.', securityType: interfaces_1.SecurityType.equity },
    { id: 21, symbol: 'MSFT', name: 'Microsoft Corporation', securityType: interfaces_1.SecurityType.equity },
    { id: 22, symbol: 'AMZN', name: 'Amazon.com Inc.', securityType: interfaces_1.SecurityType.equity },
    { id: 23, symbol: 'GOOG', name: 'Google', securityType: interfaces_1.SecurityType.equity },
    { id: 24, symbol: 'NVDA', name: 'Nvidia', securityType: interfaces_1.SecurityType.equity },
    { id: 25, symbol: 'URI', name: 'United Rental', securityType: interfaces_1.SecurityType.equity },
    { id: 26, symbol: 'CRWD', name: 'Crowdstrike', securityType: interfaces_1.SecurityType.equity },
    { id: 27, symbol: 'IJR', name: 'iShares Core S&P Small Cap', securityType: interfaces_1.SecurityType.index },
    { id: 28, symbol: 'JPM', name: 'JP Morgan', securityType: interfaces_1.SecurityType.equity },
    { id: 29, symbol: 'EQIX', name: 'Equinix', securityType: interfaces_1.SecurityType.equity },
    { id: 30, symbol: 'DIS', name: 'Disney', securityType: interfaces_1.SecurityType.equity },
    { id: 31, symbol: 'ISRG', name: 'Intuitive Surgical', securityType: interfaces_1.SecurityType.equity },
    { id: 32, symbol: 'PLTR', name: 'Palantir', securityType: interfaces_1.SecurityType.equity },
    { id: 33, symbol: 'OLN', name: 'Olin', securityType: interfaces_1.SecurityType.equity },
    { id: 34, symbol: 'EQR', name: 'Equity Residental', securityType: interfaces_1.SecurityType.equity },
    { id: 35, symbol: 'ABNB', name: 'AirBnB', securityType: interfaces_1.SecurityType.equity },
    { id: 36, symbol: 'DBRG', name: 'Digital Bridge', securityType: interfaces_1.SecurityType.equity },
    { id: 37, symbol: 'GS', name: 'Goldman Sachs', securityType: interfaces_1.SecurityType.equity },
    { id: 38, symbol: 'DB', name: 'Deutsche Bank', securityType: interfaces_1.SecurityType.equity },
    { id: 39, symbol: 'USD:CUR', name: 'US Dollar', securityType: interfaces_1.SecurityType.equity },
];
class MockRepo {
    constructor() {
        this.getCashSecurityId = () => __awaiter(this, void 0, void 0, function* () {
            const o = {
                id: 39,
                symbol: 'USD:CUR',
                address: '',
                ceo: '',
                securityName: '',
                address2: '',
                country: '',
                createdAt: luxon_1.DateTime.now().toJSDate(),
                companyName: '',
                description: '',
                employees: '',
                exchange: '',
                industry: '',
                issueType: '',
                logoUrl: '',
                phone: '',
                lastUpdated: luxon_1.DateTime.now().toJSDate(),
                sector: '',
                zip: '',
                state: '',
                tags: [],
                website: '',
                primarySicCode: ''
            };
            return Promise.resolve(o);
        });
    }
    addTradingPostBrokerageAccounts(brokerageAccounts) {
        return Promise.resolve(undefined);
    }
    addTradingPostCurrentHoldings(currentHoldings) {
        return Promise.resolve(undefined);
    }
    addTradingPostHistoricalHoldings(historicalHoldings) {
        return Promise.resolve(undefined);
    }
    addTradingPostTransactions(transactions) {
        return Promise.resolve(undefined);
    }
    getMarketHolidays(endDate) {
        return Promise.resolve([]);
    }
    getSecurityPricesWithEndDateBySecurityIds(startDate, endDate, securityIds) {
        const tradingDays = [
            luxon_1.DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-17 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
            luxon_1.DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
        ];
        const secPrices = [];
        for (let i = 0; i < Securities.length; i++) {
            const sec = Securities[i];
            for (let j = 0; j < tradingDays.length; j++) {
                const tradingDay = tradingDays[j];
                secPrices.push({
                    id: j + i,
                    price: 1,
                    securityId: sec.id,
                    low: 1,
                    open: 1,
                    high: 1,
                    time: tradingDay,
                    createdAt: luxon_1.DateTime.now()
                });
            }
        }
        return Promise.resolve(secPrices);
    }
    getTradingPostBrokerageAccount(accountId) {
        const x = {
            id: 0,
            updated_at: luxon_1.DateTime.now(),
            created_at: luxon_1.DateTime.now(),
            name: '',
            accountNumber: '',
            type: '',
            userId: '',
            institutionId: 0,
            officialName: '',
            subtype: '',
            mask: '',
            brokerName: '',
            status: '',
        };
        return Promise.resolve(x);
    }
    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(accountId) {
        return Promise.resolve([
            {
                id: 1,
                accountId: 1,
                securityId: 20,
                symbol: 'PYPL',
                value: 4200,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 35,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 120,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 2,
                accountId: 1,
                securityId: 21,
                symbol: 'MSFT',
                value: -4800,
                securityType: interfaces_1.SecurityType.equity,
                quantity: -16,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 300,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 3,
                accountId: 1,
                securityId: 22,
                symbol: 'AMZN',
                value: -54400,
                securityType: interfaces_1.SecurityType.equity,
                quantity: -17,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 3200,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 4,
                accountId: 1,
                securityId: 23,
                symbol: 'GOOG',
                value: 75600,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 27,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 2800,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 5,
                accountId: 1,
                securityId: 24,
                symbol: 'NVDA',
                value: 0,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 0,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 260,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 6,
                accountId: 1,
                securityId: 25,
                symbol: 'URI',
                value: 35640,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 108,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 330,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 7,
                accountId: 1,
                securityId: 26,
                symbol: 'CRWD',
                value: 28120,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 148,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 190,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 8,
                accountId: 1,
                securityId: 27,
                symbol: 'IJR',
                value: 200,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 2,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 100,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 9,
                accountId: 1,
                securityId: 28,
                symbol: 'JPM',
                value: -21000,
                securityType: interfaces_1.SecurityType.equity,
                quantity: -140,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 150,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 10,
                accountId: 1,
                securityId: 29,
                symbol: 'EQIX',
                value: -61600,
                securityType: interfaces_1.SecurityType.equity,
                quantity: -88,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 700,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 11,
                accountId: 1,
                securityId: 30,
                symbol: 'DIS',
                value: 600,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 4,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 150,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 12,
                accountId: 1,
                securityId: 31,
                symbol: 'ISRG',
                value: 16500,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 55,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 300,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 13,
                accountId: 1,
                securityId: 32,
                symbol: 'PLTR',
                value: 1988,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 142,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 14,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 14,
                accountId: 1,
                securityId: 33,
                symbol: 'OLN',
                value: 416,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 8,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 52,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 15,
                accountId: 1,
                securityId: 34,
                symbol: 'EQR',
                value: -3520,
                securityType: interfaces_1.SecurityType.equity,
                quantity: -40,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 88,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 16,
                accountId: 1,
                securityId: 35,
                symbol: 'ABNB',
                value: 2100,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 12,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 175,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 17,
                accountId: 1,
                securityId: 36,
                symbol: 'DBRG',
                value: 72,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 9,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 8,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 18,
                accountId: 1,
                securityId: 37,
                symbol: 'GS',
                value: 23310,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 63,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 370,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 19,
                accountId: 1,
                securityId: 38,
                symbol: 'DB',
                value: 0,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 0,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 16,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            },
            {
                id: 20,
                accountId: 1,
                securityId: 39,
                symbol: 'USD:CUR',
                value: 48323,
                securityType: interfaces_1.SecurityType.equity,
                quantity: 483231,
                priceSource: '',
                priceAsOf: luxon_1.DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: 'America/New_York' }),
                price: 1,
                currency: 'USD',
                costBasis: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now(),
            }
        ]);
    }
    getTradingPostBrokerageAccountTransactions(accountId) {
        return Promise.resolve([{
                id: 1,
                securityId: 32,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 14,
                quantity: 30,
                amount: 420,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 2,
                securityId: 30,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 176,
                quantity: 31,
                amount: 5456,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 3,
                securityId: 36,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 8,
                quantity: 21,
                amount: 168,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 4,
                securityId: 28,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 158,
                quantity: -48,
                amount: -7584,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 5,
                securityId: 31,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 349,
                quantity: -5,
                amount: -1745,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 6,
                securityId: 25,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 395,
                quantity: 37,
                amount: 14615,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 7,
                securityId: 25,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 298,
                quantity: 38,
                amount: 11324,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 8,
                securityId: 30,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 128,
                quantity: -19,
                amount: -2432,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 9,
                securityId: 27,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 84,
                quantity: 20,
                amount: 1680,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 10,
                securityId: 21,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 325,
                quantity: -37,
                amount: -12025,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 11,
                securityId: 34,
                type: interfaces_1.InvestmentTransactionType.cover,
                date: luxon_1.DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 72,
                quantity: 13,
                amount: 936,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 12,
                securityId: 29,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 820,
                quantity: -3,
                amount: -2460,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 13,
                securityId: 26,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 210,
                quantity: -12,
                amount: -2520,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 14,
                securityId: 32,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 12,
                quantity: 47,
                amount: 564,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 15,
                securityId: 28,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 139,
                quantity: -45,
                amount: -6255,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 16,
                securityId: 20,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 135,
                quantity: -21,
                amount: -2835,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 17,
                securityId: 28,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 130,
                quantity: -27,
                amount: -3510,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 18,
                securityId: 34,
                type: interfaces_1.InvestmentTransactionType.cover,
                date: luxon_1.DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 71,
                quantity: 1,
                amount: 71,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 19,
                securityId: 37,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 369,
                quantity: 28,
                amount: 10332,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 20,
                securityId: 21,
                type: interfaces_1.InvestmentTransactionType.cover,
                date: luxon_1.DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 318,
                quantity: 9,
                amount: 2862,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 21,
                securityId: 34,
                type: interfaces_1.InvestmentTransactionType.cover,
                date: luxon_1.DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 79,
                quantity: 1,
                amount: 79,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 22,
                securityId: 30,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 135,
                quantity: -19,
                amount: -2565,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 23,
                securityId: 27,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 90,
                quantity: -5,
                amount: -450,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 24,
                securityId: 26,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 220,
                quantity: 44,
                amount: 9680,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 25,
                securityId: 24,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 262,
                quantity: -20,
                amount: -5240,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 26,
                securityId: 38,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 18,
                quantity: -33,
                amount: -594,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 27,
                securityId: 29,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 714,
                quantity: -1,
                amount: -714,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 28,
                securityId: 29,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 567,
                quantity: -1,
                amount: -567,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 29,
                securityId: 36,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 8,
                quantity: -53,
                amount: -424,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 30,
                securityId: 33,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 47,
                quantity: -28,
                amount: -1316,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 31,
                securityId: 24,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 292,
                quantity: -3,
                amount: -876,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 32,
                securityId: 36,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 8,
                quantity: -4,
                amount: -32,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 33,
                securityId: 24,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 285,
                quantity: 32,
                amount: 9120,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 34,
                securityId: 25,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 389,
                quantity: 19,
                amount: 7391,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 35,
                securityId: 34,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 100,
                quantity: -40,
                amount: -4000,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 36,
                securityId: 29,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 590,
                quantity: -49,
                amount: -28910,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 37,
                securityId: 26,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 168,
                quantity: 40,
                amount: 6720,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 38,
                securityId: 30,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 168,
                quantity: 27,
                amount: 4536,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 39,
                securityId: 27,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 113,
                quantity: -25,
                amount: -2825,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 40,
                securityId: 26,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 222,
                quantity: 32,
                amount: 7104,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 41,
                securityId: 32,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 15,
                quantity: 30,
                amount: 450,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 42,
                securityId: 30,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 156,
                quantity: -34,
                amount: -5304,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 43,
                securityId: 24,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 303,
                quantity: -22,
                amount: -6666,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 44,
                securityId: 30,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 171,
                quantity: -2,
                amount: -342,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 45,
                securityId: 29,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 596,
                quantity: -39,
                amount: -23244,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 46,
                securityId: 32,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 15,
                quantity: -12,
                amount: -180,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 47,
                securityId: 20,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 137,
                quantity: 6,
                amount: 822,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 48,
                securityId: 35,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 162,
                quantity: 28,
                amount: 4536,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 49,
                securityId: 22,
                type: interfaces_1.InvestmentTransactionType.short,
                date: luxon_1.DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 3835,
                quantity: -41,
                amount: -157235,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 50,
                securityId: 22,
                type: interfaces_1.InvestmentTransactionType.cover,
                date: luxon_1.DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 3227,
                quantity: 20,
                amount: 64540,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 51,
                securityId: 26,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 224,
                quantity: 32,
                amount: 7168,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 52,
                securityId: 31,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 357,
                quantity: 32,
                amount: 11424,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 53,
                securityId: 25,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 297,
                quantity: -34,
                amount: -10098,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 54,
                securityId: 21,
                type: interfaces_1.InvestmentTransactionType.cover,
                date: luxon_1.DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 311,
                quantity: 32,
                amount: 9952,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 55,
                securityId: 35,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 145,
                quantity: -56,
                amount: -8120,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 56,
                securityId: 22,
                type: interfaces_1.InvestmentTransactionType.cover,
                date: luxon_1.DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 3499,
                quantity: 4,
                amount: 13996,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 57,
                securityId: 36,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 6,
                quantity: -5,
                amount: -30,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 58,
                securityId: 25,
                type: interfaces_1.InvestmentTransactionType.buy,
                date: luxon_1.DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 329,
                quantity: 48,
                amount: 15792,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 59,
                securityId: 24,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 265,
                quantity: -13,
                amount: -3445,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }, {
                id: 60,
                securityId: 30,
                type: interfaces_1.InvestmentTransactionType.sell,
                date: luxon_1.DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', { zone: "America/New_York" }),
                price: 142,
                quantity: -3,
                amount: -426,
                securityType: interfaces_1.SecurityType.equity,
                currency: 'USD',
                accountId: 1,
                fees: 0,
                updated_at: luxon_1.DateTime.now(),
                created_at: luxon_1.DateTime.now()
            }].sort((a, b) => {
            if (a.date.toUnixInteger() < b.date.toUnixInteger())
                return 1;
            if (a.date.toUnixInteger() > b.date.toUnixInteger())
                return -1;
            return 0;
        }));
    }
    getTradingPostBrokerageAccounts(userId) {
        return Promise.resolve([]);
    }
    upsertTradingPostBrokerageAccounts(accounts) {
        return Promise.resolve(undefined);
    }
    upsertTradingPostCurrentHoldings(currentHoldings) {
        return Promise.resolve(undefined);
    }
    upsertTradingPostHistoricalHoldings(historicalHoldings) {
        return Promise.resolve(undefined);
    }
    upsertTradingPostTransactions(transactions) {
        return Promise.resolve(undefined);
    }
    deleteTradingPostBrokerageAccounts(accountIds) {
        return Promise.resolve(undefined);
    }
    deleteTradingPostBrokerageHoldings(accountIds) {
        return Promise.resolve(undefined);
    }
    deleteTradingPostBrokerageTransactions(accountIds) {
        return Promise.resolve(undefined);
    }
}
test('holding history buy & sell', () => __awaiter(void 0, void 0, void 0, function* () {
    const portfolioSummary = new portfolio_summary_1.PortfolioSummaryService({
        addAccountGroupReturns(accountGroupReturns) {
            return Promise.resolve(0);
        },
        addAccountGroupSummary(accountGroupSummary) {
            return Promise.resolve(0);
        },
        addBenchmarkReturns(benchmarkReturns) {
            return Promise.resolve(0);
        },
        addTradingPostAccountGroup(userId, name, accountIds, defaultBenchmarkId) {
            return Promise.resolve(0);
        },
        getAccountGroupHPRsLatestDate(accountGroupId) {
            return Promise.resolve(undefined);
        },
        getDailySecurityPrices(securityId, startDate, endDate) {
            return Promise.resolve([]);
        },
        getSecurities(securityIds) {
            return Promise.resolve([]);
        },
        getTradingPostAccountGroupReturns(accountGroupId, startDate, endDate) {
            return Promise.resolve([]);
        },
        getTradingPostAccountGroups(userId) {
            return Promise.resolve([]);
        },
        getTradingPostBrokerageAccounts(userId) {
            return Promise.resolve([]);
        },
        getTradingPostCurrentHoldingsByAccountGroup(accountGroupId) {
            return Promise.resolve([]);
        },
        getTradingPostHoldingsByAccount(userId, accountId, startDate, endDate) {
            return Promise.resolve([]);
        },
        getTradingPostHoldingsByAccountGroup(userId, accountGroupId, startDate, endDate) {
            return Promise.resolve([]);
        }
    });
    const startDate = luxon_1.DateTime.fromObject({
        year: 2022,
        month: 1,
        day: 31,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }, { zone: "America/New_York" });
    const endDate = luxon_1.DateTime.fromObject({
        year: 2021,
        month: 12,
        day: 31,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }, { zone: "America/New_York" });
    const mockRepo = new MockRepo();
    const brokerage = new service_1.default({}, mockRepo, portfolioSummary);
    const holdingHistory = yield brokerage.computeHoldingsHistory(1, startDate, endDate);
    let oldestCashTime = luxon_1.DateTime.now();
    let oldestCash = 0;
    for (const hh of holdingHistory) {
        if (hh.securityId !== 39)
            continue;
        if (hh.date.toUnixInteger() < oldestCashTime.toUnixInteger()) {
            oldestCashTime = hh.date;
            oldestCash = hh.quantity;
        }
    }
    expect(oldestCash).toBe(400000);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQXlDO0FBQ3pDLGlDQUErQjtBQUUvQiw2Q0FvQnNCO0FBQ3RCLDJEQUE0RDtBQUc1RCxNQUFNLFVBQVUsR0FBZTtJQUMzQixFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsWUFBWSxFQUFFLHlCQUFZLENBQUMsTUFBTSxFQUFDO0lBQ3pGLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBRSxZQUFZLEVBQUUseUJBQVksQ0FBQyxNQUFNLEVBQUM7SUFDMUYsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSx5QkFBWSxDQUFDLE1BQU0sRUFBQztJQUNwRixFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSx5QkFBWSxDQUFDLE1BQU0sRUFBQztJQUMzRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSx5QkFBWSxDQUFDLE1BQU0sRUFBQztJQUMzRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSx5QkFBWSxDQUFDLE1BQU0sRUFBQztJQUNqRixFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSx5QkFBWSxD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QztZQUM3RixnQkFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBQyxDQUFDO1lBQzdGLGdCQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFDLENBQUM7WUFDN0YsZ0JBQVEsQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztZQUM3RixnQkFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBQyxDQUFDO1lBQzdGLGdCQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFDLENBQUM7WUFDN0YsZ0JBQVEsQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztZQUM3RixnQkFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBQyxDQUFDO1lBQzdGLGdCQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFDLENBQUM7WUFDN0YsZ0JBQVEsQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztZQUM3RixnQkFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBQyxDQUFDO1lBQzdGLGdCQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLEVBQUMsSUFBSSxFQUFFLGtC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