import { DateTime } from "luxon";
export interface IBrokerageService {
    generateBrokerageAuthenticationLink(userId: string, brokerageAccount?: string): Promise<string>;
    importAccounts(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostBrokerageAccounts[]>;
    importTransactions(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostTransactions[]>;
    importHoldings(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostCurrentHoldings[]>;
    computeHoldingsHistory(userId: string): Promise<TradingPostHistoricalHoldings[]>;
    exportAccounts(userId: string): Promise<TradingPostBrokerageAccounts[]>;
    exportTransactions(userId: string): Promise<TradingPostTransactions[]>;
    exportHoldings(userId: string): Promise<TradingPostCurrentHoldings[]>;
}
export interface IBrokerageRepository {
    addTradingPostBrokerageAccounts(brokerageAccounts: TradingPostBrokerageAccounts[]): Promise<void>;
    addTradingPostBrokerageHoldings(holdings: TradingPostCurrentHoldings[]): Promise<void>;
    addTradingPostBrokerageTransactions(transactions: TradingPostTransactions[]): Promise<void>;
    addTradingPostBrokerageHoldingsHistory(holdingsHistory: TradingPostHistoricalHoldings[]): Promise<void>;
}
export interface IFinicityRepository {
    getFinicityUser(userId: string): Promise<FinicityUser | null>;
    addFinicityUser(userId: string, customerId: string, type: string): Promise<FinicityUser>;
    upsertFinicityInstitutions(institutions: FinicityInstitution[]): Promise<void>;
    upsertInstitutions(institutions: TradingPostInstitution[]): Promise<void>;
    getTradingPostInstitutionsWithFinicityInstitutionId(): Promise<TradingPostInstitutionWithFinicityInstitutionId[]>;
    addFinicityAccounts(accounts: FinicityAccount[]): Promise<void>;
    getFinicityAccounts(finicityUserId: number): Promise<FinicityAccount[]>;
    upsertFinicityHoldings(holdings: FinicityHolding[]): Promise<void>;
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
export declare type FinicityUser = {
    id: number;
    tpUserId: string;
    customerId: string;
    type: string;
    updatedAt: DateTime;
    createdAt: DateTime;
};
export declare type FinicityInstitution = {
    id: number;
    institutionId: number;
    name: string;
    voa: boolean;
    voi: boolean;
    stateAgg: boolean;
    ach: boolean;
    transAgg: boolean;
    aha: boolean;
    availBalance: boolean;
    accountOwner: boolean;
    loanPaymentDetails: boolean;
    studentLoanData: boolean;
    accountTypeDescription: string;
    phone: string;
    urlHomeApp: string;
    urlLogonApp: string;
    oauthEnabled: boolean;
    urlForgotPassword: string;
    urlOnlineRegistration: string;
    class: string;
    specialText: string;
    timeZone: string;
    specialInstructions: string;
    specialInstructionsTitle: string;
    addressCity: string;
    addressState: string;
    addressCountry: string;
    addressPostalCode: string;
    addressLine1: string;
    addressLine2: string;
    currency: string;
    email: string;
    status: string;
    newInstitutionId: string;
    brandingLogo: string;
    brandingAlternateLogo: string;
    brandingIcon: string;
    brandingPrimaryColor: string;
    brandingTitle: string;
    oauthInstitutionId: string;
    productionStatusOverall: string;
    productionStatusTransAgg: string;
    productionStatusVoa: string;
    productionStatusStateAgg: string;
    productionStatusAch: string;
    productionStatusAha: string;
    updatedAt: DateTime;
    createdAt: DateTime;
};
export declare type FinicityAccount = {
    id: number;
    finicityUserId: number;
    finicityInstitutionId: number;
    accountId: string;
    number: string;
    realAccountNumberLast4: string;
    accountNumberDisplay: string;
    name: string;
    balance: number;
    type: string;
    aggregationStatusCode: number;
    status: string;
    customerId: string;
    institutionId: string;
    balanceDate: number;
    aggregationSuccessDate: number;
    aggregationAttemptDate: number;
    createdDate: number;
    currency: string;
    lastTransactionDate: number;
    oldestTransactionDate: number;
    institutionLoginId: number;
    lastUpdatedDate: number;
    detailMargin: number;
    detailMarginAllowed: boolean;
    detailCashAccountAllowed: boolean;
    detailDescription: string;
    detailMarginBalance: number;
    detailShortBalance: number;
    detailAvailableCashBalance: number;
    detailCurrentBalance: number;
    detailDateAsOf: number;
    displayPosition: number;
    parentAccount: number;
    accountNickname: string;
    marketSegment: string;
    updatedAt: DateTime;
    createdAt: DateTime;
};
export declare type FinicityHolding = {
    id: number;
    finicityAccountId: number;
    holdingId: number;
    securityIdType: string;
    posType: string;
    subAccountType: string;
    description: string;
    symbol: string;
    cusipNo: string;
    currentPrice: number;
    transactionType: string;
    marketValue: string;
    securityUnitPrice: number;
    units: number;
    costBasis: number;
    status: string;
    securityType: string;
    securityName: string;
    securityCurrency: string;
    currentPriceDate: number;
    optionStrikePrice: number;
    optionType: string;
    optionSharesPerContract: number;
    optionsExpireDate: number;
    fiAssetClass: string;
    assetClass: string;
    currencyRate: number;
    costBasisPerShare: number;
    mfType: string;
    totalGlDollar: number;
    totalGlPercent: number;
    todayGlDollar: number;
    todayGlPercent: number;
    updatedAt: DateTime;
    createdAt: DateTime;
};
export declare type FinicityTransaction = {
    id: number;
    finicityAccountId: number;
    transactionId: number;
    amount: number;
    accountId: string;
    customerId: string;
    status: string;
    description: string;
    memo: string;
    type: string;
    interestAmount: number;
    principalAmount: number;
    feeAmount: number;
    escrowAmount: number;
    unitQuantity: number;
    postedDate: number;
    transactionDate: number;
    createdDate: number;
    categorizationNormalizedPayeeName: string;
    categorizationCategory: string;
    categorizationCity: string;
    categorizationState: string;
    categorizationPostalCode: string;
    categorizationCountry: string;
    categorizationBestRepresentation: string;
    runningBalanceAmount: number;
    checkNum: number;
    incomeType: string;
    subaccountSecurityType: string;
    commissionAmount: number;
    splitDenominator: number;
    splitNumerator: number;
    sharesPerContract: number;
    taxesAmount: number;
    unitPrice: number;
    currencySymbol: string;
    subAccountFund: string;
    ticker: string;
    securityId: string;
    securityIdType: string;
    investmentTransactionType: string;
    effectiveDate: string;
    firstEffectiveDate: string;
    updatedAt: DateTime;
    createdAt: DateTime;
};
export interface GetSecurityBySymbol {
    id: number;
    symbol: string;
    companyName: string;
    exchange: string;
    industry: string;
    website: string;
    description: string;
    ceo: string;
    securityName: string;
    issueType: string;
    sector: string;
    primarySicCode: string;
    employees: string;
    tags: string[];
    address: string;
    address2: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    logoUrl: string;
    lastUpdated: Date;
    createdAt: Date;
}
export declare type TableInfo = {
    id: number;
    created_at: DateTime;
    updated_at: DateTime;
};
export declare type TradingPostCurrentHoldings = {
    accountId: number;
    securityId: number;
    securityType: SecurityType | null;
    price: number;
    priceAsOf: DateTime;
    priceSource: string;
    value: number;
    costBasis: number | null;
    quantity: number;
    currency: string | null;
};
export declare type TradingPostCurrentHoldingsTable = TradingPostCurrentHoldings & TableInfo;
export declare type TradingPostHistoricalHoldings = {
    accountId: number;
    securityId: number;
    securityType: SecurityType | null;
    price: number;
    priceAsOf: DateTime;
    priceSource: string;
    value: number;
    costBasis: number | null;
    quantity: number;
    currency: string | null;
    date: DateTime;
};
export declare type TradingPostHistoricalHoldingsTable = TradingPostHistoricalHoldings & TableInfo;
export declare type HistoricalHoldings = {
    accountId?: number;
    accountGroupId?: number;
    securityId: number;
    price: number;
    value: number;
    costBasis: number;
    quantity: number;
    date: DateTime;
};
export declare type TradingPostExposure = {
    long: number;
    short: number;
    gross: number;
    net: number;
};
export declare type TradingPostSectorAllocations = {
    sector: string;
    value: number;
};
export declare type TradingPostCustomIndustry = {
    userId: string;
    securityId: number;
    industry: string;
};
export declare type TradingPostCustomIndustryTable = TradingPostCustomIndustry & TableInfo;
export declare type TradingPostTransactions = {
    accountId: number;
    securityId: number;
    securityType: SecurityType;
    date: DateTime;
    quantity: number;
    price: number;
    amount: number;
    fees: number | null;
    type: InvestmentTransactionType;
    currency: string;
};
export declare type TradingPostTransactionsTable = TradingPostTransactions & TableInfo;
export declare enum SecurityType {
    equity = "equity",
    option = "option",
    index = "index",
    mutualFund = "mutualFund",
    cashEquivalent = "cashEquivalent",
    fixedIncome = "fixedIncome",
    currency = "currency",
    unknown = "unknown"
}
export declare enum InvestmentTransactionType {
    buy = "buy",
    sell = "sell",
    short = "short",
    cover = "cover",
    cancel = "cancel",
    fee = "fee",
    cash = "cash",
    transfer = "transfer",
    dividendOrInterest = "dividendOrInterest"
}
export declare type TradingPostInstitution = {
    name: string;
    accountTypeDescription: string;
    phone: string;
    urlHomeApp: string;
    urlLogonApp: string;
    oauthEnabled: boolean;
    urlForgotPassword: string;
    urlOnlineRegistration: string;
    class: string;
    addressCity: string;
    addressState: string;
    addressCountry: string;
    addressPostalCode: string;
    addressAddressLine1: string;
    addressAddressLine2: string;
    email: string;
    status: string;
};
export declare type TradingPostInstitutionTable = {
    id: number;
    updatedAt: DateTime;
    createdAt: DateTime;
} & TradingPostInstitution;
export declare type TradingPostInstitutionWithFinicityInstitutionId = {
    internalFinicityId: number;
    externalFinicityId: string;
} & TradingPostInstitutionTable;
export declare type TradingPostBrokerageAccounts = {
    userId: string;
    institutionId: number;
    brokerName: string;
    status: string;
    accountNumber: string;
    mask: string | null;
    name: string;
    officialName: string | null;
    type: string;
    subtype: string | null;
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
export declare type SecuritySymbolAndName = {
    id: number;
    symbol: string;
    name: string;
};
