import { IDatabase, IMain } from "pg-promise";
import { DateTime } from "luxon";
import Finicity from "../finicity";
import { PortfolioSummaryService } from "./portfolio-summary";
import { HistoricalHoldings, TradingPostAccountGroupStats, AccountGroupHPRsTable, TradingPostTransactionsByAccountGroup } from './interfaces';
export default class Brokerage {
    private readonly brokerageMap;
    private repository;
    portfolioSummaryService: PortfolioSummaryService;
    constructor(pgClient: IDatabase<any>, pgp: IMain, finicity: Finicity);
    getUserHoldings: (tpUserId: string) => Promise<HistoricalHoldings[]>;
    getUserTrades: (tpUserId: string, paging?: {
        limit: number;
        offset: number;
    }) => Promise<TradingPostTransactionsByAccountGroup[]>;
    getUserAccountGroupSummary: (tpUserId: string) => Promise<TradingPostAccountGroupStats>;
    getUserReturns: (tpUserId: string, startDate: DateTime, endDate?: DateTime) => Promise<AccountGroupHPRsTable[]>;
    addNewAccounts: (brokerageUserId: string, brokerageId: string, accountIds?: string[]) => Promise<void>;
    pullNewTransactionsAndHoldings: (brokerageId: string, brokerageUserId: string) => Promise<void>;
    addNewTransactions: (brokerageUserId: string, brokerageId: string, accountIds?: string[]) => Promise<void>;
    removeAccounts: (brokerageCustomerId: string, accountIds: string[], brokerageId: string) => Promise<void>;
    generateBrokerageAuthenticationLink: (userId: string, brokerageId: string, brokerageAccountId?: string) => Promise<string>;
}
