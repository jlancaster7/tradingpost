import { DateTime } from "luxon";
import { AccountGroupHPRs, HistoricalHoldings, ISummaryRepository, ISummaryService, SecurityHPRs, TradingPostAccountGroupStats, TradingPostExposure, TradingPostSectorAllocations } from './interfaces';
export declare class PortfolioSummaryService implements ISummaryService {
    private repository;
    constructor(repository: ISummaryRepository);
    computeAccountGroupHPRs: (holdings: HistoricalHoldings[]) => Promise<AccountGroupHPRs[]>;
    addAccountGroupHPRs: (accountGroupHPRs: AccountGroupHPRs[]) => Promise<number>;
    computeSecurityHPRs: (securityId: number, startDate: DateTime, endDate?: DateTime) => Promise<SecurityHPRs[]>;
    addBenchmarkHPRs: (benchmarkHPRs: SecurityHPRs[]) => Promise<number>;
    computeSecurityBeta: (securityId: number, benchmarkId: number, daysPrior?: number) => Promise<number>;
    computeAccountGroupBeta: (holdings: HistoricalHoldings[], benchmarkId: number, daysPrior?: number) => Promise<number>;
    computeSharpe: (holdingsReturns: AccountGroupHPRs[]) => number;
    computeSectorAllocations: (holdings: HistoricalHoldings[]) => Promise<TradingPostSectorAllocations[]>;
    computeExposure: (holdings: HistoricalHoldings[]) => TradingPostExposure;
    computeAccountGroupSummary: (userId: string, startDate: DateTime, endDate?: DateTime) => Promise<TradingPostAccountGroupStats | null>;
}
