import { AccountGroupHPRs, AccountGroupHPRsTable, FinicityAccount, FinicityHolding, FinicityInstitution, FinicityTransaction, FinicityUser, GetSecurityBySymbol, HistoricalHoldings, IBrokerageRepository, ISummaryRepository, SecurityHPRs, SecurityPrices, TradingPostAccountGroups, TradingPostAccountGroupStats, TradingPostBrokerageAccounts, TradingPostBrokerageAccountsTable, TradingPostAccountToAccountGroup, TradingPostCurrentHoldings, TradingPostCustomIndustry, TradingPostHistoricalHoldings, TradingPostInstitution, TradingPostInstitutionTable, TradingPostInstitutionWithFinicityInstitutionId, TradingPostTransactions, TradingPostBrokerageAccountWithFinicity, SecurityIssue } from "./interfaces";
import { IDatabase, IMain } from "pg-promise";
import { DateTime } from "luxon";
export default class Repository implements IBrokerageRepository, ISummaryRepository {
    private db;
    private readonly pgp;
    constructor(db: IDatabase<any>, pgp: IMain);
    getTradingPostAccountsWithFinicityNumber: (userId: string) => Promise<TradingPostBrokerageAccountWithFinicity[]>;
    getSecuritiesWithIssue: () => Promise<SecurityIssue[]>;
    getTradingPostInstitutionsWithFinicityId: () => Promise<TradingPostInstitutionWithFinicityInstitutionId[]>;
    addTradingPostBrokerageHoldings(holdings: TradingPostCurrentHoldings[]): Promise<void>;
    addTradingPostBrokerageTransactions(transactions: TradingPostTransactions[]): Promise<void>;
    addTradingPostBrokerageHoldingsHistory(holdingsHistory: TradingPostHistoricalHoldings[]): Promise<void>;
    upsertInstitutions: (institutions: TradingPostInstitution[]) => Promise<void>;
    getInstitutions: () => Promise<TradingPostInstitutionTable[]>;
    getTradingPostInstitutionsWithFinicityInstitutionId: () => Promise<TradingPostInstitutionWithFinicityInstitutionId[]>;
    upsertFinicityInstitutions: (institutions: FinicityInstitution[]) => Promise<void>;
    getFinicityInstitutions: () => Promise<FinicityInstitution[]>;
    getFinicityInstitutionsById: (finicityInstitutionIds: number[]) => Promise<FinicityInstitution[]>;
    getFinicityUser: (userId: string) => Promise<FinicityUser | null>;
    addFinicityUser: (userId: string, customerId: string, type: string) => Promise<FinicityUser>;
    addFinicityAccount: (account: FinicityAccount) => Promise<FinicityAccount>;
    addFinicityAccounts: (accounts: FinicityAccount[]) => Promise<void>;
    getFinicityAccounts: (finicityUserId: number) => Promise<FinicityAccount[]>;
    upsertFinicityHoldings: (holdings: FinicityHolding[]) => Promise<void>;
    getFinicityHoldings: (finicityUserId: number) => Promise<FinicityHolding[]>;
    upsertFinicityTransactions: (transactions: FinicityTransaction[]) => Promise<void>;
    getFinicityTransactions: (finicityUserId: number) => Promise<FinicityTransaction[]>;
    getTradingPostBrokerageAccounts: (userId: string) => Promise<TradingPostBrokerageAccountsTable[]>;
    addTradingPostBrokerageAccounts: (accounts: TradingPostBrokerageAccounts[]) => Promise<void>;
    upsertTradingPostBrokerageAccounts: (accounts: TradingPostBrokerageAccounts[]) => Promise<void>;
    addTradingPostAccountGroups: (accountGroups: TradingPostAccountGroups[]) => Promise<void>;
    getTradingPostAccountGroups: (userId: string) => Promise<TradingPostAccountGroups[]>;
    addTradingPostAccountGroup: (userId: string, name: string, accountIds: number[], defaultBenchmarkId: number) => Promise<number>;
    addTradingPostCurrentHoldings: (currentHoldings: TradingPostCurrentHoldings[]) => Promise<void>;
    upsertTradingPostCurrentHoldings: (currentHoldings: TradingPostCurrentHoldings[]) => Promise<void>;
    addTradingPostHistoricalHoldings: (historicalHoldings: TradingPostHistoricalHoldings[]) => Promise<void>;
    upsertTradingPostHistoricalHoldings: (historicalHoldings: TradingPostHistoricalHoldings[]) => Promise<void>;
    addTradingPostCustomIndustries: (customIndustries: TradingPostCustomIndustry[]) => Promise<void>;
    addTradingPostTransactions: (transactions: TradingPostTransactions[]) => Promise<void>;
    upsertTradingPostTransactions: (transactions: TradingPostTransactions[]) => Promise<void>;
    addTradingPostAccountGroupStats: (groupStats: TradingPostAccountGroupStats[]) => Promise<void>;
    addTradingPostAccountToAccountGroup: (accountToAccountGroups: TradingPostAccountToAccountGroup[]) => Promise<void>;
    getTradingPostHoldingsByAccount: (userId: string, accountId: number, startDate: DateTime, endDate: DateTime) => Promise<HistoricalHoldings[]>;
    getTradingPostHoldingsByAccountGroup: (userId: string, accountGroupId: number, startDate: DateTime, endDate?: DateTime) => Promise<HistoricalHoldings[]>;
    getTradingPostCurrentHoldingsByAccountGroup: (accountGroupId: number) => Promise<HistoricalHoldings[]>;
    getTradingPostAccountGroupReturns: (accountGroupId: number, startDate: DateTime, endDate: DateTime) => Promise<AccountGroupHPRsTable[]>;
    getDailySecurityPrices: (securityId: number, startDate: DateTime, endDate: DateTime) => Promise<SecurityPrices[]>;
    getSecurities: (securityIds: number[]) => Promise<GetSecurityBySymbol[]>;
    getAccountGroupHPRsLatestDate: (accountGroupId: number) => Promise<any>;
    addAccountGroupReturns: (accountGroupReturns: AccountGroupHPRs[]) => Promise<number>;
    addBenchmarkReturns: (benchmarkReturns: SecurityHPRs[]) => Promise<number>;
    addAccountGroupSummary: (accountGroupSummary: TradingPostAccountGroupStats) => Promise<number>;
}
