import { DateTime } from "luxon";
import { AccountGroupHPRs, HistoricalHoldings, ISummaryRepository, ISummaryService, SecurityHPRs, TradingPostAccountGroupStats, TradingPostExposure, TradingPostSectorAllocations, TradingPostAccountGroups, AccountGroupHPRsTable, TradingPostTransactionsByAccountGroup } from './interfaces';
export declare class PortfolioSummaryService implements ISummaryService {
    private repository;
    constructor(repository: ISummaryRepository);
    computeAccountGroupHPRs: (holdings: HistoricalHoldings[], trades: TradingPostTransactionsByAccountGroup[]) => Promise<AccountGroupHPRs[]>;
    addAccountGroupHPRs: (accountGroupHPRs: AccountGroupHPRs[]) => Promise<number>;
    computeSecurityHPRs: (securityId: number, startDate: DateTime, endDate?: DateTime) => Promise<SecurityHPRs[]>;
    addBenchmarkHPRs: (benchmarkHPRs: SecurityHPRs[]) => Promise<number>;
    computeSecurityBeta: (securityId: number, benchmarkId: number, daysPrior?: number) => Promise<number>;
    computeAccountGroupBeta: (holdings: HistoricalHoldings[], benchmarkId: number, daysPrior?: number) => Promise<number>;
    computeSharpe: (holdingsReturns: AccountGroupHPRs[]) => number;
    computeSectorAllocations: (holdings: HistoricalHoldings[]) => Promise<TradingPostSectorAllocations[]>;
    computeExposure: (holdings: HistoricalHoldings[]) => TradingPostExposure;
    computeAccountGroupSummary: (userId: string, startDate?: DateTime, endDate?: DateTime) => Promise<TradingPostAccountGroupStats>;
    addAccountGroupSummary: (summary: TradingPostAccountGroupStats) => Promise<void>;
    getCurrentHoldings: (userId: string) => Promise<HistoricalHoldings[]>;
    getTrades: (userId: string, paging: {
        limit: number;
        offset: number;
    } | undefined, cash?: boolean) => Promise<TradingPostTransactionsByAccountGroup[]>;
    getReturns: (userId: string, startDate: DateTime, endDate: DateTime) => Promise<AccountGroupHPRsTable[]>;
    getSummary: (userId: string) => Promise<TradingPostAccountGroupStats>;
    getAccountGroupByName: (userId: string, accountGroupName: string) => Promise<TradingPostAccountGroups>;
}
