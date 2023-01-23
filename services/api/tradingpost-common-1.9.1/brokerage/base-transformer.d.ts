import { GetSecurityBySymbol, GetSecurityPrice, InvestmentTransactionType, OptionContract, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostCurrentHoldingsTableWithSecurity, TradingPostHistoricalHoldings, TradingPostTransactions, TradingPostTransactionsTable } from "./interfaces";
import { DateTime } from "luxon";
import { getUSExchangeHoliday } from "../market-data/interfaces";
export declare const transformTransactionTypeAmount: (txType: InvestmentTransactionType, transaction: TradingPostTransactions) => TradingPostTransactions;
type historicalAccount = {
    date: DateTime;
    cash: number;
    holdings: TradingPostHistoricalHoldings[];
};
export interface BaseRepository {
    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<number[]>;
    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>;
    deleteTradingPostAccountCurrentHoldings(accountIds: number[]): Promise<void>;
    upsertOptionContract(oc: OptionContract): Promise<number | null>;
    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>;
    upsertTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>;
    getOldestTransaction(accountId: number): Promise<TradingPostTransactions | null>;
    getCashSecurityId(): Promise<GetSecurityBySymbol>;
    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(accountId: number): Promise<TradingPostCurrentHoldingsTableWithSecurity[]>;
    getTradingPostBrokerageAccountTransactions(accountId: number): Promise<TradingPostTransactionsTable[]>;
    getMarketHolidays(start: DateTime, end: DateTime): Promise<getUSExchangeHoliday[]>;
    getSecurityPricesWithEndDateBySecurityIds(startDate: DateTime, endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]>;
}
export default class BaseTransformer {
    private _baseRepo;
    constructor(repo: BaseRepository);
    upsertAccounts: (accounts: TradingPostBrokerageAccounts[]) => Promise<void>;
    upsertPositions: (positions: TradingPostCurrentHoldings[], accountIds: number[]) => Promise<void>;
    upsertTransactions: (transactions: TradingPostTransactions[]) => Promise<void>;
    upsertHistoricalHoldings: (historicalHoldings: TradingPostHistoricalHoldings[]) => Promise<void>;
    computeHoldingsHistory: (tpAccountId: number) => Promise<void>;
    undoTransactions: (historicalAccount: historicalAccount, transactions: TradingPostTransactionsTable[]) => historicalAccount;
    getSecurityPrices: (securityIds: number[], startDate: DateTime, endDate: DateTime) => Promise<Record<number, GetSecurityPrice[]>>;
    getTradingDays: (start: DateTime, end: DateTime) => Promise<DateTime[]>;
    getClosestPrice: (securityPricesMap: Record<number, GetSecurityPrice[]>, securityId: number, postingDate: DateTime) => number | null;
}
export {};
