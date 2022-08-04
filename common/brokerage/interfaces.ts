import {DateTime} from "luxon";
import {getUSExchangeHoliday} from "../market-data/interfaces";

export interface IBrokerageService {
    generateBrokerageAuthenticationLink(userId: string, brokerageAccount?: string): Promise<string>

    importAccounts(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostBrokerageAccounts[]>

    importTransactions(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostTransactions[]>

    importHoldings(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostCurrentHoldings[]>

    exportAccounts(userId: string): Promise<TradingPostBrokerageAccounts[]>

    exportTransactions(userId: string): Promise<TradingPostTransactions[]>

    exportHoldings(userId: string): Promise<TradingPostCurrentHoldings[]>
}

export interface IBrokerageRepository {
    addTradingPostBrokerageAccounts(brokerageAccounts: TradingPostBrokerageAccounts[]): Promise<void>

    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<void>

    addTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    addTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>

    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>

    addTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>

    upsertTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>

    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>

    getTradingPostBrokerageAccount(accountId: number): Promise<TradingPostBrokerageAccountsTable>

    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(accountId: number): Promise<TradingPostCurrentHoldingsTableWithSecurity[]>

    getTradingPostBrokerageAccountTransactions(accountId: number): Promise<TradingPostTransactionsTable[]>

    getMarketHolidays(endDate: DateTime): Promise<getUSExchangeHoliday[]>

    getSecurityPricesWithEndDateBySecurityIds(endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]>
}

export interface IFinicityRepository {
    getFinicityUser(userId: string): Promise<FinicityUser | null>

    addFinicityUser(userId: string, customerId: string, type: string): Promise<FinicityUser>

    upsertFinicityInstitutions(institutions: FinicityInstitution[]): Promise<void>

    upsertFinicityInstitution(institution: FinicityInstitution): Promise<number>

    upsertInstitutions(institutions: TradingPostInstitution[]): Promise<void>

    upsertInstitution(institution: TradingPostInstitution): Promise<number>

    getTradingPostInstitutionsWithFinicityInstitutionId(): Promise<TradingPostInstitutionWithFinicityInstitutionId[]>

    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>

    upsertFinicityAccounts(accounts: FinicityAccount[]): Promise<void>

    getFinicityAccounts(finicityUserId: number): Promise<FinicityAccount[]>

    upsertFinicityHoldings(holdings: FinicityHolding[]): Promise<void>

    upsertFinicityTransactions(transactions: FinicityTransaction[]): Promise<void>

    getFinicityHoldings(finicityUserId: number): Promise<FinicityHolding[]>

    getFinicityTransactions(finicityUserId: number): Promise<FinicityTransaction[]>
}

export interface ISummaryRepository {
    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>

    getTradingPostAccountGroups(userId: string): Promise<TradingPostAccountGroups[]>

    getTradingPostHoldingsByAccount(userId: string, accountId: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>

    getTradingPostHoldingsByAccountGroup(userId: string, accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>

    getTradingPostCurrentHoldingsByAccountGroup(accountGroupId: number): Promise<HistoricalHoldings[]>

    getTradingPostAccountGroupReturns(accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]>

    getDailySecurityPrices(securityId: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]>

    getSecurities(securityIds: number[]): Promise<GetSecurityBySymbol[]>

    getAccountGroupHPRsLatestDate(accountGroupId: number): Promise<any>

    addTradingPostAccountGroup(userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number>

    addAccountGroupReturns(accountGroupReturns: AccountGroupHPRs[]): Promise<number>

    addBenchmarkReturns(benchmarkReturns: SecurityHPRs[]): Promise<number>

    addAccountGroupSummary(accountGroupSummary: TradingPostAccountGroupStats): Promise<number>
}

export interface ISummaryService {
    computeAccountGroupHPRs(holdings: HistoricalHoldings[]): Promise<AccountGroupHPRs[]>

    addAccountGroupHPRs(accountGroupHPRs: AccountGroupHPRs[]): Promise<number>

    computeSecurityHPRs(securityId: number, startDate: DateTime, endDate: DateTime): Promise<SecurityHPRs[]>

    addBenchmarkHPRs(benchmarkHPRs: SecurityHPRs[]): Promise<number>

    computeSecurityBeta(securityId: number, benchmarkId: number, daysPrior: number): Promise<number>

    computeAccountGroupBeta(holdings: HistoricalHoldings[], daysPrior: number): Promise<number>

    computeSharpe(holdingsReturns: AccountGroupHPRs[]): number

    computeSectorAllocations(holdings: HistoricalHoldings[]): Promise<TradingPostSectorAllocations[]>

    computeExposure(holdings: HistoricalHoldings[]): TradingPostExposure

    computeAccountGroupSummary(accountGroupId: string, startDate: DateTime, endDate: DateTime): Promise<TradingPostAccountGroupStats | null>
}

export type GetSecurityPrice = {
    id: number
    securityId: number
    price: number
    time: DateTime
    high: number
    open: number
    low: number
    updatedAt: DateTime
    createdAt: DateTime
}

export type FinicityUser = {
    id: number
    tpUserId: string
    customerId: string
    type: string
    updatedAt: DateTime
    createdAt: DateTime
}

export type FinicityInstitution = {
    id: number
    institutionId: number
    name: string
    voa: boolean
    voi: boolean
    stateAgg: boolean
    ach: boolean
    transAgg: boolean
    aha: boolean
    availBalance: boolean
    accountOwner: boolean
    loanPaymentDetails: boolean
    studentLoanData: boolean
    accountTypeDescription: string
    phone: string
    urlHomeApp: string
    urlLogonApp: string
    oauthEnabled: boolean
    urlForgotPassword: string
    urlOnlineRegistration: string
    class: string
    specialText: string
    timeZone: string
    specialInstructions: string
    specialInstructionsTitle: string
    addressCity: string
    addressState: string
    addressCountry: string
    addressPostalCode: string
    addressLine1: string
    addressLine2: string
    currency: string
    email: string
    status: string
    newInstitutionId: string
    brandingLogo: string
    brandingAlternateLogo: string
    brandingIcon: string
    brandingPrimaryColor: string
    brandingTitle: string
    oauthInstitutionId: string
    productionStatusOverall: string
    productionStatusTransAgg: string
    productionStatusVoa: string
    productionStatusStateAgg: string
    productionStatusAch: string
    productionStatusAha: string
    updatedAt: DateTime
    createdAt: DateTime
}

export type FinicityAccount = {
    id: number
    finicityUserId: number
    finicityInstitutionId: number

    accountId: string
    number: string
    realAccountNumberLast4: string
    accountNumberDisplay: string
    name: string
    balance: number
    type: string
    aggregationStatusCode: number
    status: string
    customerId: string
    institutionId: string
    balanceDate: number
    aggregationSuccessDate: number
    aggregationAttemptDate: number
    createdDate: number
    currency: string
    lastTransactionDate: number
    oldestTransactionDate: number
    institutionLoginId: number
    lastUpdatedDate: number
    detailMargin: number
    detailMarginAllowed: boolean
    detailCashAccountAllowed: boolean
    detailDescription: string
    detailMarginBalance: number
    detailShortBalance: number
    detailAvailableCashBalance: number
    detailCurrentBalance: number
    detailDateAsOf: number
    displayPosition: number
    parentAccount: number
    accountNickname: string
    marketSegment: string
    updatedAt: DateTime
    createdAt: DateTime
}

export type FinicityHolding = {
    id: number
    finicityAccountId: number
    holdingId: number
    securityIdType: string
    posType: string
    subAccountType: string
    description: string
    symbol: string
    cusipNo: string
    currentPrice: number
    transactionType: string
    marketValue: string
    securityUnitPrice: number
    units: number
    costBasis: number
    status: string
    securityType: string
    securityName: string
    securityCurrency: string
    currentPriceDate: number
    optionStrikePrice: number
    optionType: string
    optionSharesPerContract: number
    optionsExpireDate: number
    fiAssetClass: string
    assetClass: string
    currencyRate: number
    costBasisPerShare: number
    mfType: string
    totalGlDollar: number
    totalGlPercent: number
    todayGlDollar: number
    todayGlPercent: number
    updatedAt: DateTime
    createdAt: DateTime
}

export type FinicityTransaction = {
    id: number
    internalFinicityAccountId: number
    transactionId: number
    accountId: string
    customerId: string
    amount: number
    description: string
    postedDate: number
    transactionDate: number
    investmentTransactionType: string

    status: string | null
    memo: string | null
    type: string | null
    unitQuantity: number | null
    feeAmount: number | null
    cusipNo: string | null
    createdDate: number | null
    categorizationNormalizedPayeeName: string | null
    categorizationCategory: string | null
    categorizationBestRepresentation: string | null
    categorizationCountry: string | null
    commissionAmount: number | null
    ticker: string | null
    unitPrice: number | null

    updatedAt: DateTime
    createdAt: DateTime
}

export type TradingPostBrokerageAccountWithFinicity = {
    internalFinicityAccountId: number
    internalFinicityUserId: number
    internalFinicityInstitutionId: number
    externalFinicityAccountId: string
    externalFinicityAccountNumber: string
    name: string
    type: string
} & TradingPostBrokerageAccountsTable

export interface GetSecurityBySymbol {
    id: number
    symbol: string
    companyName: string
    exchange: string
    industry: string
    website: string
    description: string
    ceo: string
    securityName: string
    issueType: string
    sector: string
    primarySicCode: string
    employees: string
    tags: string[]
    address: string
    address2: string
    state: string
    zip: string
    country: string
    phone: string
    logoUrl: string
    lastUpdated: Date
    createdAt: Date
}

export type TableInfo = {
    id: number
    created_at: DateTime
    updated_at: DateTime
}

export type TradingPostCurrentHoldings = {
    accountId: number
    securityId: number
    securityType: SecurityType | null
    price: number
    priceAsOf: DateTime
    priceSource: string
    value: number
    costBasis: number | null
    quantity: number
    currency: string | null
}

export type TradingPostCurrentHoldingsTable = TradingPostCurrentHoldings & TableInfo;

export type TradingPostCurrentHoldingsTableWithSecurity = {
    symbol: string
} & TradingPostCurrentHoldingsTable


export type TradingPostHistoricalHoldings = {
    accountId: number
    securityId: number
    securityType: SecurityType | null
    price: number
    priceAsOf: DateTime
    priceSource: string
    value: number
    costBasis: number | null
    quantity: number
    currency: string | null
    date: DateTime
}

export type TradingPostHistoricalHoldingsTable = TradingPostHistoricalHoldings & TableInfo;

export type HistoricalHoldings = {
    accountId?: number,
    accountGroupId?: number,
    securityId: number
    price: number
    value: number
    costBasis: number
    quantity: number
    date: DateTime
}

export type TradingPostExposure = {
    long: number
    short: number
    gross: number
    net: number
}

export type TradingPostSectorAllocations = {
    sector: string
    value: number
}

export type TradingPostCustomIndustry = {
    userId: string
    securityId: number
    industry: string
}

export type TradingPostCustomIndustryTable = TradingPostCustomIndustry & TableInfo;

export type TradingPostTransactions = {
    accountId: number
    securityId: number
    securityType: SecurityType
    date: DateTime
    quantity: number
    price: number
    amount: number // (quantity * price) + fees
    fees: number | null
    type: InvestmentTransactionType
    currency: string | null
}

export type TradingPostTransactionsTable = TradingPostTransactions & TableInfo;

export enum SecurityType {
    equity = "equity",
    option = "option",
    index = "index",
    mutualFund = "mutualFund",
    cashEquivalent = "cashEquivalent", // A money market fund would be an example of a cash equivalent
    fixedIncome = "fixedIncome",
    currency = "currency",
    unknown = "unknown"
}

export enum InvestmentTransactionType {
    buy = "buy",
    sell = "sell",
    short = "short",
    cover = "cover",
    cancel = "cancel",
    fee = "fee",
    cash = "cash",
    transfer = "transfer", // Transfers of security between brokerages
    dividendOrInterest = "dividendOrInterest"
}

export type TradingPostInstitution = {
    externalId: string
    name: string
    accountTypeDescription: string
    phone: string
    urlHomeApp: string
    urlLogonApp: string
    oauthEnabled: boolean
    urlForgotPassword: string
    urlOnlineRegistration: string
    class: string
    addressCity: string
    addressState: string
    addressCountry: string
    addressPostalCode: string
    addressAddressLine1: string
    addressAddressLine2: string
    email: string
    status: string
}

export type TradingPostInstitutionTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & TradingPostInstitution

export type TradingPostInstitutionWithFinicityInstitutionId = {
    internalFinicityId: number
    externalFinicityId: string
} & TradingPostInstitutionTable

export type TradingPostBrokerageAccounts = {
    userId: string
    institutionId: number
    brokerName: string
    status: string
    accountNumber: string
    mask: string | null
    name: string
    officialName: string | null
    type: string // Margin or Cash Account
    subtype: string | null
}

export type TradingPostBrokerageAccountsTable = TradingPostBrokerageAccounts & TableInfo;

export type TradingPostAccountGroups = {
    name: string // all accounts under 'default'
    accountGroupId: number
    userId: string
    accountId: number
    defaultBenchmarkId: number // References securities table
}

export type TradingPostAccountToAccountGroup = {
    accountId: number
    accountGroupId: number
}

export type TradingPostAccountToAccountGroupTable = TradingPostAccountToAccountGroup & TableInfo

export type TradingPostAccountGroupsTable = TradingPostAccountGroups & TableInfo;

export type TradingPostAccountGroupStats = {
    accountGroupId: number
    beta: number
    sharpe: number
    industryAllocations: TradingPostSectorAllocations[]
    exposure: TradingPostExposure
    date: DateTime
    benchmarkId: number // References securities table
}

export type TradingPostAccountGroupStatsTable = TradingPostAccountGroupStats & TableInfo;

export type SecurityPrices = {
    securityId: number
    date: DateTime
    price: number
}

export type SecurityPricesTable = SecurityPrices & { id: number, created_at: DateTime };

export type SecurityHPRs = {
    securityId: number
    date: DateTime
    return: number
}

export type SecurityHPRsTable = SecurityHPRs & TableInfo;

export type AccountGroupHPRs = {
    accountGroupId: number
    date: DateTime
    return: number
}

export type AccountGroupHPRsTable = AccountGroupHPRs & TableInfo;

export type SecurityIssue = {
    id: number
    symbol: string
    name: string
    issueType: string
}