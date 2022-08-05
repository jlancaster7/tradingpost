import { DateTime } from "luxon";
import { getUSExchangeHoliday } from "../market-data/interfaces";
export interface IBrokerageService {
    getTradingPostUserAssociatedWithBrokerageUser(brokerageUserId: string): Promise<TradingPostUser>;
    generateBrokerageAuthenticationLink(userId: string, brokerageAccount?: string): Promise<string>;
    importAccounts(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostBrokerageAccounts[]>;
    importTransactions(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostTransactions[]>;
    importHoldings(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostCurrentHoldings[]>;
    exportAccounts(userId: string): Promise<TradingPostBrokerageAccounts[]>;
    exportTransactions(userId: string): Promise<TradingPostTransactions[]>;
    exportHoldings(userId: string): Promise<TradingPostCurrentHoldings[]>;
    removeAccounts(brokerageCustomerId: string, accountIds: string[]): Promise<number[]>;
}
export interface IBrokerageRepository {
    getCashSecurityId(): Promise<GetSecurityBySymbol>;
    addTradingPostBrokerageAccounts(brokerageAccounts: TradingPostBrokerageAccounts[]): Promise<void>;
    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<void>;
    addTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>;
    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>;
    addTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>;
    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>;
    addTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>;
    upsertTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>;
    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>;
    getTradingPostBrokerageAccount(accountId: number): Promise<TradingPostBrokerageAccountsTable>;
    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(accountId: number): Promise<TradingPostCurrentHoldingsTableWithSecurity[]>;
    getTradingPostBrokerageAccountTransactions(accountId: number): Promise<TradingPostTransactionsTable[]>;
    getMarketHolidays(start: DateTime, end: DateTime): Promise<getUSExchangeHoliday[]>;
    getSecurityPricesWithEndDateBySecurityIds(startDate: DateTime, endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]>;
    deleteTradingPostBrokerageAccounts(accountIds: number[]): Promise<void>;
    deleteTradingPostBrokerageTransactions(accountIds: number[]): Promise<void>;
    deleteTradingPostBrokerageHoldings(accountIds: number[]): Promise<void>;
    deleteTradingPostBrokerageHistoricalHoldings(tpAccountIds: number[]): Promise<void>;
}
export interface IFinicityRepository {
    getTradingPostUserByFinicityCustomerId(finicityCustomerId: string): Promise<TradingPostUser | null>;
    getFinicityUserByFinicityCustomerId(customerId: string): Promise<FinicityUser | null>;
    getFinicityUser(userId: string): Promise<FinicityUser | null>;
    addFinicityUser(userId: string, customerId: string, type: string): Promise<FinicityUser>;
    upsertFinicityInstitutions(institutions: FinicityInstitution[]): Promise<void>;
    upsertFinicityInstitution(institution: FinicityInstitution): Promise<number>;
    upsertInstitutions(institutions: TradingPostInstitution[]): Promise<void>;
    upsertInstitution(institution: TradingPostInstitution): Promise<number>;
    getTradingPostInstitutionsWithFinicityInstitutionId(): Promise<TradingPostInstitutionWithFinicityInstitutionId[]>;
    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>;
    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>;
    upsertFinicityAccounts(accounts: FinicityAccount[]): Promise<void>;
    getFinicityAccounts(finicityUserId: number): Promise<FinicityAccount[]>;
    upsertFinicityHoldings(holdings: FinicityHolding[]): Promise<void>;
    upsertFinicityTransactions(transactions: FinicityTransaction[]): Promise<void>;
    getFinicityHoldings(finicityUserId: number): Promise<FinicityHolding[]>;
    getFinicityTransactions(finicityUserId: number): Promise<FinicityTransaction[]>;
    deleteFinicityHoldings(accountIds: number[]): Promise<void>;
    deleteFinicityTransactions(accountIds: number[]): Promise<void>;
    deleteFinicityAccounts(accountIds: number[]): Promise<void>;
}
export interface ISummaryRepository {
    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>;
    getTradingPostAccountGroups(userId: string): Promise<TradingPostAccountGroups[]>;
    getTradingPostHoldingsByAccount(userId: string, accountId: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>;
    getTradingPostHoldingsByAccountGroup(userId: string, accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>;
    getTradingPostCurrentHoldingsByAccountGroup(accountGroupId: number): Promise<HistoricalHoldings[]>;
    getTradingPostAccountGroupReturns(accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]>;
    getDailySecurityPrices(securityId: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]>;
    getSecurities(securityIds: number[]): Promise<GetSecurityBySymbol[]>;
    getAccountGroupHPRsLatestDate(accountGroupId: number): Promise<any>;
    addTradingPostAccountGroup(userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number>;
    addAccountGroupReturns(accountGroupReturns: AccountGroupHPRs[]): Promise<number>;
    addBenchmarkReturns(benchmarkReturns: SecurityHPRs[]): Promise<number>;
    addAccountGroupSummary(accountGroupSummary: TradingPostAccountGroupStats): Promise<number>;
}
export interface ISummaryService {
    computeAccountGroupHPRs(holdings: HistoricalHoldings[]): Promise<AccountGroupHPRs[]>;
    addAccountGroupHPRs(accountGroupHPRs: AccountGroupHPRs[]): Promise<number>;
    computeSecurityHPRs(securityId: number, startDate: DateTime, endDate: DateTime): Promise<SecurityHPRs[]>;
    addBenchmarkHPRs(benchmarkHPRs: SecurityHPRs[]): Promise<number>;
    computeSecurityBeta(securityId: number, benchmarkId: number, daysPrior: number): Promise<number>;
    computeAccountGroupBeta(holdings: HistoricalHoldings[], daysPrior: number): Promise<number>;
    computeSharpe(holdingsReturns: AccountGroupHPRs[]): number;
    computeSectorAllocations(holdings: HistoricalHoldings[]): Promise<TradingPostSectorAllocations[]>;
    computeExposure(holdings: HistoricalHoldings[]): TradingPostExposure;
    computeAccountGroupSummary(accountGroupId: string, startDate: DateTime, endDate: DateTime): Promise<TradingPostAccountGroupStats | null>;
}
export declare type TradingPostUser = {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
    email: string;
    profileUrl: string;
    settings: Record<string, any>;
    bio: string;
    bannerUrl: string;
    tags: any;
    createdAt: DateTime;
    updatedAt: DateTime;
    analystProfile: any;
    hasProfilePic: boolean;
    dummy: boolean;
};
export declare type TradingPostBrokerageAccountsTable = TradingPostBrokerageAccounts & TableInfo;
export declare type TradingPostAccountGroups = {
    name: string;
    accountGroupId: number;
    userId: string;
    accountId: number;
    defaultBenchmarkId: number;
};
export declare type TradingPostAccountToAccountGroup = {
    accountId: number;
    accountGroupId: number;
};
export declare type TradingPostAccountToAccountGroupTable = TradingPostAccountToAccountGroup & TableInfo;
export declare type TradingPostAccountGroupsTable = TradingPostAccountGroups & TableInfo;
export declare type TradingPostAccountGroupStats = {
    accountGroupId: number;
    beta: number;
    sharpe: number;
    industryAllocations: TradingPostSectorAllocations[];
    exposure: TradingPostExposure;
    date: DateTime;
    benchmarkId: number;
};
export declare type TradingPostAccountGroupStatsTable = TradingPostAccountGroupStats & TableInfo;
export declare type SecurityPrices = {
    securityId: number;
    date: DateTime;
    price: number;
};
export declare type SecurityPricesTable = SecurityPrices & {
    id: number;
    created_at: DateTime;
};
export declare type SecurityHPRs = {
    securityId: number;
    date: DateTime;
    return: number;
};
export declare type SecurityHPRsTable = SecurityHPRs & TableInfo;
export declare type AccountGroupHPRs = {
    accountGroupId: number;
    date: DateTime;
    return: number;
};
export declare type AccountGroupHPRsTable = AccountGroupHPRs & TableInfo;
export declare type SecurityIssue = {
    id: number;
    symbol: string;
    name: string;
    issueType: string;
};
