import BrokerageService from './service';
import {DateTime} from "luxon";
import {getUSExchangeHoliday} from "../market-data/interfaces";
import {
    AccountGroupHPRs,
    AccountGroupHPRsTable,
    GetSecurityBySymbol,
    GetSecurityPrice,
    HistoricalHoldings,
    IBrokerageRepository,
    InvestmentTransactionType,
    SecurityHPRs,
    SecurityPrices,
    SecurityType,
    TradingPostAccountGroups,
    TradingPostAccountGroupStats,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountsTable,
    TradingPostCurrentHoldings,
    TradingPostCurrentHoldingsTableWithSecurity,
    TradingPostHistoricalHoldings,
    TradingPostTransactions,
    TradingPostTransactionsTable
} from "./interfaces";
import {PortfolioSummaryService} from "./portfolio-summary";

type Security = { id: number, symbol: string, name: string, securityType: SecurityType }
const Securities: Security[] = [
    {id: 20, symbol: 'PYPL', name: 'Paypal Holdings Inc.', securityType: SecurityType.equity},
    {id: 21, symbol: 'MSFT', name: 'Microsoft Corporation', securityType: SecurityType.equity},
    {id: 22, symbol: 'AMZN', name: 'Amazon.com Inc.', securityType: SecurityType.equity},
    {id: 23, symbol: 'GOOG', name: 'Google', securityType: SecurityType.equity},
    {id: 24, symbol: 'NVDA', name: 'Nvidia', securityType: SecurityType.equity},
    {id: 25, symbol: 'URI', name: 'United Rental', securityType: SecurityType.equity},
    {id: 26, symbol: 'CRWD', name: 'Crowdstrike', securityType: SecurityType.equity},
    {id: 27, symbol: 'IJR', name: 'iShares Core S&P Small Cap', securityType: SecurityType.index},
    {id: 28, symbol: 'JPM', name: 'JP Morgan', securityType: SecurityType.equity},
    {id: 29, symbol: 'EQIX', name: 'Equinix', securityType: SecurityType.equity},
    {id: 30, symbol: 'DIS', name: 'Disney', securityType: SecurityType.equity},
    {id: 31, symbol: 'ISRG', name: 'Intuitive Surgical', securityType: SecurityType.equity},
    {id: 32, symbol: 'PLTR', name: 'Palantir', securityType: SecurityType.equity},
    {id: 33, symbol: 'OLN', name: 'Olin', securityType: SecurityType.equity},
    {id: 34, symbol: 'EQR', name: 'Equity Residental', securityType: SecurityType.equity},
    {id: 35, symbol: 'ABNB', name: 'AirBnB', securityType: SecurityType.equity},
    {id: 36, symbol: 'DBRG', name: 'Digital Bridge', securityType: SecurityType.equity},
    {id: 37, symbol: 'GS', name: 'Goldman Sachs', securityType: SecurityType.equity},
    {id: 38, symbol: 'DB', name: 'Deutsche Bank', securityType: SecurityType.equity},
    {id: 39, symbol: 'USD:CUR', name: 'US Dollar', securityType: SecurityType.equity},
]

class MockRepo implements IBrokerageRepository {
    constructor() {
    }

    getCashSecurityId = async (): Promise<GetSecurityBySymbol> => {
        const o: GetSecurityBySymbol = {
            id: 39,
            symbol: 'USD:CUR',
            address: '',
            ceo: '',
            securityName: '',
            address2: '',
            country: '',
            createdAt: DateTime.now().toJSDate(),
            companyName: '',
            description: '',
            employees: '',
            exchange: '',
            industry: '',
            issueType: '',
            logoUrl: '',
            phone: '',
            lastUpdated: DateTime.now().toJSDate(),
            sector: '',
            zip: '',
            state: '',
            tags: [],
            website: '',
            primarySicCode: ''
        }
        return Promise.resolve(o)
    }

    addTradingPostBrokerageAccounts(brokerageAccounts: TradingPostBrokerageAccounts[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    addTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    addTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    addTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    getMarketHolidays(endDate: DateTime): Promise<getUSExchangeHoliday[]> {
        return Promise.resolve([]);
    }

    getSecurityPricesWithEndDateBySecurityIds(startDate: DateTime, endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]> {
        const tradingDays = [
            DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-17 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
        ];

        const secPrices: GetSecurityPrice[] = [];
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
                    createdAt: DateTime.now()
                })
            }
        }

        return Promise.resolve(secPrices);
    }

    getTradingPostBrokerageAccount(accountId: number): Promise<TradingPostBrokerageAccountsTable> {
        const x: TradingPostBrokerageAccountsTable = {
            id: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now(),
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
        }
        return Promise.resolve(x)
    }

    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(accountId: number): Promise<TradingPostCurrentHoldingsTableWithSecurity[]> {
        return Promise.resolve([
            {
                id: 1,
                accountId: 1,
                securityId: 20, //
                symbol: 'PYPL',
                value: 4200,
                securityType: SecurityType.equity,
                quantity: 35,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 120,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 2,
                accountId: 1,
                securityId: 21, //
                symbol: 'MSFT',
                value: -4800,
                securityType: SecurityType.equity,
                quantity: -16,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 300,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 3,
                accountId: 1,
                securityId: 22, //
                symbol: 'AMZN',
                value: -54400,
                securityType: SecurityType.equity,
                quantity: -17,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 3200,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 4,
                accountId: 1,
                securityId: 23, //
                symbol: 'GOOG',
                value: 75600,
                securityType: SecurityType.equity,
                quantity: 27,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 2800,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 5,
                accountId: 1,
                securityId: 24, //
                symbol: 'NVDA',
                value: 0,
                securityType: SecurityType.equity,
                quantity: 0,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 260,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 6,
                accountId: 1,
                securityId: 25, //
                symbol: 'URI',
                value: 35640,
                securityType: SecurityType.equity,
                quantity: 108,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 330,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 7,
                accountId: 1,
                securityId: 26, //
                symbol: 'CRWD',
                value: 28120,
                securityType: SecurityType.equity,
                quantity: 148,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 190,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 8,
                accountId: 1,
                securityId: 27, //
                symbol: 'IJR',
                value: 200,
                securityType: SecurityType.equity,
                quantity: 2,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 100,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 9,
                accountId: 1,
                securityId: 28, //
                symbol: 'JPM',
                value: -21000,
                securityType: SecurityType.equity,
                quantity: -140,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 150,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 10,
                accountId: 1,
                securityId: 29, //
                symbol: 'EQIX',
                value: -61600,
                securityType: SecurityType.equity,
                quantity: -88,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 700,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 11,
                accountId: 1,
                securityId: 30, //
                symbol: 'DIS',
                value: 600,
                securityType: SecurityType.equity,
                quantity: 4,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 150,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 12,
                accountId: 1,
                securityId: 31, //
                symbol: 'ISRG',
                value: 16500,
                securityType: SecurityType.equity,
                quantity: 55,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 300,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 13,
                accountId: 1,
                securityId: 32, //
                symbol: 'PLTR',
                value: 1988,
                securityType: SecurityType.equity,
                quantity: 142,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 14,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 14,
                accountId: 1,
                securityId: 33, //
                symbol: 'OLN',
                value: 416,
                securityType: SecurityType.equity,
                quantity: 8,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 52,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 15,
                accountId: 1,
                securityId: 34, //
                symbol: 'EQR',
                value: -3520,
                securityType: SecurityType.equity,
                quantity: -40,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 88,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 16,
                accountId: 1,
                securityId: 35, //
                symbol: 'ABNB',
                value: 2100,
                securityType: SecurityType.equity,
                quantity: 12,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 175,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 17,
                accountId: 1,
                securityId: 36, //
                symbol: 'DBRG',
                value: 72,
                securityType: SecurityType.equity,
                quantity: 9,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 8,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 18,
                accountId: 1,
                securityId: 37, //
                symbol: 'GS',
                value: 23310,
                securityType: SecurityType.equity,
                quantity: 63,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 370,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 19,
                accountId: 1,
                securityId: 38, //
                symbol: 'DB',
                value: 0,
                securityType: SecurityType.equity,
                quantity: 0,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 16,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            },
            {
                id: 20,
                accountId: 1,
                securityId: 39, //
                symbol: 'USD:CUR',
                value: 48323,
                securityType: SecurityType.equity,
                quantity: 483231,
                priceSource: '',
                priceAsOf: DateTime.fromFormat('2022-02-09 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: 'America/New_York'}),
                price: 1,
                currency: 'USD',
                costBasis: 0,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
            }
        ]);
    }

    getTradingPostBrokerageAccountTransactions(accountId: number): Promise<TradingPostTransactionsTable[]> {
        return Promise.resolve([{
            id: 1,
            securityId: 32,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 14,
            quantity: 30,
            amount: 420,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 2,
            securityId: 30,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 176,
            quantity: 31,
            amount: 5456,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 3,
            securityId: 36,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-03 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 8,
            quantity: 21,
            amount: 168,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 4,
            securityId: 28,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 158,
            quantity: -48,
            amount: -7584,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 5,
            securityId: 31,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 349,
            quantity: -5,
            amount: -1745,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 6,
            securityId: 25,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-04 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 395,
            quantity: 37,
            amount: 14615,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 7,
            securityId: 25,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 298,
            quantity: 38,
            amount: 11324,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 8,
            securityId: 30,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 128,
            quantity: -19,
            amount: -2432,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 9,
            securityId: 27,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-05 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 84,
            quantity: 20,
            amount: 1680,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 10,
            securityId: 21,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 325,
            quantity: -37,
            amount: -12025,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 11,
            securityId: 34,
            type: InvestmentTransactionType.cover,
            date: DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 72,
            quantity: 13,
            amount: 936,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 12,
            securityId: 29,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-06 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 820,
            quantity: -3,
            amount: -2460,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 13,
            securityId: 26,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 210,
            quantity: -12,
            amount: -2520,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 14,
            securityId: 32,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 12,
            quantity: 47,
            amount: 564,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 15,
            securityId: 28,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-07 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 139,
            quantity: -45,
            amount: -6255,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 16,
            securityId: 20,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 135,
            quantity: -21,
            amount: -2835,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 17,
            securityId: 28,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 130,
            quantity: -27,
            amount: -3510,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 18,
            securityId: 34,
            type: InvestmentTransactionType.cover,
            date: DateTime.fromFormat('2022-01-10 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 71,
            quantity: 1,
            amount: 71,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 19,
            securityId: 37,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 369,
            quantity: 28,
            amount: 10332,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 20,
            securityId: 21,
            type: InvestmentTransactionType.cover,
            date: DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 318,
            quantity: 9,
            amount: 2862,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 21,
            securityId: 34,
            type: InvestmentTransactionType.cover,
            date: DateTime.fromFormat('2022-01-11 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 79,
            quantity: 1,
            amount: 79,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 22,
            securityId: 30,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 135,
            quantity: -19,
            amount: -2565,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 23,
            securityId: 27,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 90,
            quantity: -5,
            amount: -450,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 24,
            securityId: 26,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-12 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 220,
            quantity: 44,
            amount: 9680,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 25,
            securityId: 24,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 262,
            quantity: -20,
            amount: -5240,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 26,
            securityId: 38,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 18,
            quantity: -33,
            amount: -594,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 27,
            securityId: 29,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-13 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 714,
            quantity: -1,
            amount: -714,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 28,
            securityId: 29,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 567,
            quantity: -1,
            amount: -567,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 29,
            securityId: 36,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 8,
            quantity: -53,
            amount: -424,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 30,
            securityId: 33,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-14 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 47,
            quantity: -28,
            amount: -1316,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 31,
            securityId: 24,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 292,
            quantity: -3,
            amount: -876,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 32,
            securityId: 36,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 8,
            quantity: -4,
            amount: -32,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 33,
            securityId: 24,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-18 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 285,
            quantity: 32,
            amount: 9120,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 34,
            securityId: 25,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 389,
            quantity: 19,
            amount: 7391,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 35,
            securityId: 34,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 100,
            quantity: -40,
            amount: -4000,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 36,
            securityId: 29,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-19 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 590,
            quantity: -49,
            amount: -28910,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 37,
            securityId: 26,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 168,
            quantity: 40,
            amount: 6720,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 38,
            securityId: 30,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 168,
            quantity: 27,
            amount: 4536,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 39,
            securityId: 27,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-20 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 113,
            quantity: -25,
            amount: -2825,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 40,
            securityId: 26,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 222,
            quantity: 32,
            amount: 7104,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 41,
            securityId: 32,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 15,
            quantity: 30,
            amount: 450,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 42,
            securityId: 30,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-21 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 156,
            quantity: -34,
            amount: -5304,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 43,
            securityId: 24,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 303,
            quantity: -22,
            amount: -6666,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 44,
            securityId: 30,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 171,
            quantity: -2,
            amount: -342,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 45,
            securityId: 29,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-24 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 596,
            quantity: -39,
            amount: -23244,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 46,
            securityId: 32,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 15,
            quantity: -12,
            amount: -180,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 47,
            securityId: 20,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 137,
            quantity: 6,
            amount: 822,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 48,
            securityId: 35,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-25 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 162,
            quantity: 28,
            amount: 4536,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 49,
            securityId: 22,
            type: InvestmentTransactionType.short,
            date: DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 3835,
            quantity: -41,
            amount: -157235,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 50,
            securityId: 22,
            type: InvestmentTransactionType.cover,
            date: DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 3227,
            quantity: 20,
            amount: 64540,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 51,
            securityId: 26,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-26 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 224,
            quantity: 32,
            amount: 7168,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 52,
            securityId: 31,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 357,
            quantity: 32,
            amount: 11424,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 53,
            securityId: 25,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 297,
            quantity: -34,
            amount: -10098,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 54,
            securityId: 21,
            type: InvestmentTransactionType.cover,
            date: DateTime.fromFormat('2022-01-27 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 311,
            quantity: 32,
            amount: 9952,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 55,
            securityId: 35,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 145,
            quantity: -56,
            amount: -8120,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 56,
            securityId: 22,
            type: InvestmentTransactionType.cover,
            date: DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 3499,
            quantity: 4,
            amount: 13996,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 57,
            securityId: 36,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-28 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 6,
            quantity: -5,
            amount: -30,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 58,
            securityId: 25,
            type: InvestmentTransactionType.buy,
            date: DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 329,
            quantity: 48,
            amount: 15792,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 59,
            securityId: 24,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 265,
            quantity: -13,
            amount: -3445,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }, {
            id: 60,
            securityId: 30,
            type: InvestmentTransactionType.sell,
            date: DateTime.fromFormat('2022-01-31 16:00:00', 'yyyy-LL-dd HH:mm:ss', {zone: "America/New_York"}),
            price: 142,
            quantity: -3,
            amount: -426,
            securityType: SecurityType.equity,
            currency: 'USD',
            accountId: 1,
            fees: 0,
            updated_at: DateTime.now(),
            created_at: DateTime.now()
        }].sort((a, b) => {
            if (a.date.toUnixInteger() < b.date.toUnixInteger()) return 1;
            if (a.date.toUnixInteger() > b.date.toUnixInteger()) return -1;
            return 0
        }));
    }

    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]> {
        return Promise.resolve([]);
    }

    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    upsertTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteTradingPostBrokerageAccounts(accountIds: number[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteTradingPostBrokerageHoldings(accountIds: number[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteTradingPostBrokerageTransactions(accountIds: number[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteTradingPostBrokerageHistoricalHoldings(tpAccountIds: number[]): Promise<void> {
        return Promise.resolve(undefined);
    }
}

// test('holding history buy & sell', async () => {
//     const portfolioSummary = new PortfolioSummaryService({
//         addAccountGroupReturns(accountGroupReturns: AccountGroupHPRs[]): Promise<number> {
//             return Promise.resolve(0);
//         },
//         addAccountGroupSummary(accountGroupSummary: TradingPostAccountGroupStats): Promise<number> {
//             return Promise.resolve(0);
//         },
//         addBenchmarkReturns(benchmarkReturns: SecurityHPRs[]): Promise<number> {
//             return Promise.resolve(0);
//         },
//         addTradingPostAccountGroup(userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number> {
//             return Promise.resolve(0);
//         },
//         getAccountGroupHPRsLatestDate(accountGroupId: number): Promise<any> {
//             return Promise.resolve(undefined);
//         },
//         getDailySecurityPrices(securityId: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]> {
//             return Promise.resolve([]);
//         },
//         getSecurities(securityIds: number[]): Promise<GetSecurityBySymbol[]> {
//             return Promise.resolve([]);
//         },
//         getTradingPostAccountGroupReturns(accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]> {
//             return Promise.resolve([]);
//         },
//         getTradingPostAccountGroups(userId: string): Promise<TradingPostAccountGroups[]> {
//             return Promise.resolve([]);
//         },
//         getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]> {
//             return Promise.resolve([]);
//         },
//         getTradingPostCurrentHoldingsByAccountGroup(accountGroupId: number): Promise<HistoricalHoldings[]> {
//             return Promise.resolve([]);
//         },
//         getTradingPostHoldingsByAccount(userId: string, accountId: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]> {
//             return Promise.resolve([]);
//         },
//         getTradingPostHoldingsByAccountGroup(userId: string, accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]> {
//             return Promise.resolve([]);
//         }
//     })

//     const startDate = DateTime.fromObject({
//         year: 2022,
//         month: 1,
//         day: 31,
//         hour: 0,
//         minute: 0,
//         second: 0,
//         millisecond: 0
//     }, {zone: "America/New_York"});
//     const endDate = DateTime.fromObject({
//         year: 2021,
//         month: 12,
//         day: 31,
//         hour: 0,
//         minute: 0,
//         second: 0,
//         millisecond: 0
//     }, {zone: "America/New_York"});

//     const mockRepo = new MockRepo();
//     const brokerage = new BrokerageService({}, mockRepo, portfolioSummary);

//     const holdingHistory = await brokerage.computeHoldingsHistory(1, startDate, endDate);

//     let oldestCashTime = DateTime.now();
//     let oldestCash = 0;

//     for (const hh of holdingHistory) {
//         if (hh.securityId !== 39) continue

//         if (hh.date.toUnixInteger() < oldestCashTime.toUnixInteger()) {
//             oldestCashTime = hh.date
//             oldestCash = hh.quantity
//         }
//     }

//     expect(oldestCash).toBe(400000)
// })