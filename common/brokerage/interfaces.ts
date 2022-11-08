import {DateTime} from "luxon";
import {getUSExchangeHoliday} from "../market-data/interfaces";

export interface IBrokerageService {
    getTradingPostUserAssociatedWithBrokerageUser(brokerageUserId: string): Promise<TradingPostUser>

    generateBrokerageAuthenticationLink(userId: string, brokerageAccount?: string, brokerageAccountId?: string): Promise<string>

    importAccounts(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostBrokerageAccounts[]>

    importTransactions(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostTransactions[]>

    importHoldings(userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostCurrentHoldings[]>

    exportAccounts(userId: string): Promise<TradingPostBrokerageAccounts[]>

    exportTransactions(userId: string): Promise<TradingPostTransactions[]>

    exportHoldings(userId: string): Promise<TradingPostCurrentHoldings[]>

    removeAccounts(brokerageCustomerId: string, accountIds: string[]): Promise<number[]>
}

export interface IBrokerageRepository {
    addTradingPostAccountGroup(userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number>

    getCashSecurityId(): Promise<GetSecurityBySymbol>

    addTradingPostBrokerageAccounts(brokerageAccounts: TradingPostBrokerageAccounts[]): Promise<void>

    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<number[]>

    addTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    updateErrorStatusOfAccount(accountId: number, error: boolean, errorCode: number): Promise<void>

    addTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>

    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>

    addTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>

    upsertTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>

    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>

    getTradingPostBrokerageAccount(accountId: number): Promise<TradingPostBrokerageAccountsTable>

    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(accountId: number): Promise<TradingPostCurrentHoldingsTableWithSecurity[]>

    getTradingPostBrokerageAccountTransactions(accountId: number): Promise<TradingPostTransactionsTable[]>

    getMarketHolidays(start: DateTime, end: DateTime): Promise<getUSExchangeHoliday[]>

    getSecurityPricesWithEndDateBySecurityIds(startDate: DateTime, endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]>

    deleteTradingPostBrokerageAccounts(accountIds: number[]): Promise<void>

    deleteTradingPostAccountCurrentHoldings(accountIds: number[]): Promise<void>

    getOldestTransaction(accountId: number): Promise<TradingPostTransactions | null>
}

export interface IFinicityRepository {
    updateErrorStatusOfAccount(accountId: number, error: boolean, errorCode: number): Promise<void>

    getTradingPostUserByFinicityCustomerId(finicityCustomerId: string): Promise<TradingPostUser | null>

    getFinicityAccountByTradingpostBrokerageAccountId(tpBrokerageAccountId: number): Promise<FinicityAndTradingpostBrokerageAccount | null>

    getFinicityAccountByFinicityAccountId(finicityAccountId: string): Promise<FinicityAccountAndInstitution>

    getFinicityUserByFinicityCustomerId(customerId: string): Promise<FinicityUser | null>

    getFinicityUserByFinicityUserId(userId: string): Promise<FinicityUser | null>

    getFinicityUser(userId: string): Promise<FinicityUser | null>

    addFinicityUser(userId: string, customerId: string, type: string): Promise<FinicityUser>

    upsertFinicityInstitutions(institutions: FinicityInstitution[]): Promise<void>

    upsertFinicityInstitution(institution: FinicityInstitution): Promise<number>

    upsertInstitutions(institutions: TradingPostInstitution[]): Promise<void>

    upsertInstitution(institution: TradingPostInstitution): Promise<number>

    getTradingPostInstitutionsWithFinicityInstitutionId(): Promise<TradingPostInstitutionWithFinicityInstitutionId[]>

    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>

    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>

    upsertFinicityAccounts(accounts: FinicityAccount[]): Promise<void>

    getFinicityAccounts(finicityUserId: number): Promise<FinicityAccount[]>

    upsertFinicityHoldings(holdings: FinicityHolding[]): Promise<void>

    upsertFinicityTransactions(transactions: FinicityTransaction[]): Promise<void>

    getFinicityHoldings(finicityUserId: number): Promise<FinicityHolding[]>

    getFinicityTransactions(finicityUserId: number): Promise<FinicityTransaction[]>

    deleteFinicityHoldings(accountIds: number[]): Promise<void>

    deleteFinicityTransactions(accountIds: number[]): Promise<void>

    deleteFinicityAccounts(accountIds: number[]): Promise<void>
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

    getAccountGroupSummary(accountGroupId: number): Promise<TradingPostAccountGroupStats>

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

    getCurrentHoldings(userId: string): Promise<HistoricalHoldings[]>

    getSummary(userId: string): Promise<TradingPostAccountGroupStats>

    getReturns(userId: string, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]>

    getAccountGroupByName(userId: string, accountGroupName: string): Promise<TradingPostAccountGroups>

    computeExposure(holdings: HistoricalHoldings[]): TradingPostExposure

    computeAccountGroupSummary(accountGroupId: string, startDate: DateTime, endDate: DateTime): Promise<TradingPostAccountGroupStats>

    addAccountGroupSummary(summary: TradingPostAccountGroupStats): Promise<void>
}

export type FinicityAndTradingpostBrokerageAccount = {
    finicityInternalAccountId: number
    finicityInternalUserId: number
    finicityInternalInstitutionId: number
    finicityAccountId: string
    finicityInstitutionLoginId: number
    accountNumber: string
    tradingpostInternalBrokerageAccountId: number
    tradingpostUserId: string
    tradingpostInternalInstitutionId: number
    status: string
    error: boolean
    errorCode: number
}

export type FinicityAccountAndInstitution = {
    id: number
    finicityAccountId: string
    finicityCustomerId: string
    institutionName: string
    finicityInstitutionId: string
}

export type TradingPostUser = {
    id: string
    firstName: string
    lastName: string
    handle: string
    email: string
    profileUrl: string
    settings: Record<string, any>
    bio: string
    bannerUrl: string
    tags: any
    createdAt: DateTime
    updatedAt: DateTime
    analystProfile: any
    hasProfilePic: boolean
    dummy: boolean
}

export type GetSecurityPrice = {
    id: number
    securityId: number
    price: number
    time: DateTime
    high: number
    open: number
    low: number
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

    txPushId: string
    txPushSigningKey: string
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
    optionExpiredate: number
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

export type TableInfoV2 = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
}

export type TableInfo = {
    id: number
    created_at: DateTime
    updated_at: DateTime
}

export type TradingPostCurrentHoldings = {
    accountId: number
    securityId: number
    optionId: number | null
    securityType: SecurityType
    price: number
    priceAsOf: DateTime
    priceSource: string
    value: number
    costBasis: number | null
    quantity: number
    currency: string | null,
    holdingDate: DateTime
}

export type TradingPostCurrentHoldingsTable = TradingPostCurrentHoldings & TableInfo;

export type TradingPostCurrentHoldingsTableWithMostRecentHolding = {
    id: number
    userId: string
    institutionId: number
    brokerName: string
    status: string
    accountNumber: string
    mask: string
    name: string
    officialName: string
    type: string
    subtype: string
    updatedAt: DateTime
    createdAt: DateTime
    error: boolean
    errorCode: number
    mostRecentHolding: DateTime | null
}


export type TradingPostCurrentHoldingsTableWithSecurity = {
    symbol: string
} & TradingPostCurrentHoldingsTable


export type TradingPostHistoricalHoldings = {
    accountId: number
    securityId: number
    securityType: SecurityType | null
    optionId: number | null
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
    accountId?: number
    accountGroupId?: number
    securityId: number
    optionId: number | null
    price: number
    value: number
    costBasis: number
    pnl: number
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
    optionId: number | null
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
    error: boolean
    errorCode: number
}

export type TradingPostBrokerageAccountsTable = TradingPostBrokerageAccounts & TableInfoV2;

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

export type TradingPostCashSecurity = {
    fromSymbol: string
    toSecurityId: number
    currency: string
}

export type TradingPostCashSecurityTable = TradingPostCashSecurity & TableInfo;

export type OptionContract = {
    securityId: number
    type: string
    strikePrice: number
    expiration: DateTime
    externalId: string | null
}

export type OptionContractTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & OptionContract

export enum BrokerageJobStatusType {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    FAILED = "FAILED",
    SUCCESSFUL = "SUCCESSFUL"
}

export type BrokerageJobStatus = {
    brokerage: string
    brokerageUserId: string
    dateToProcess: DateTime
    status: BrokerageJobStatusType
    data?: any
}

export type BrokerageJobStatusTable = {
    id: number
    brokerage: string
    brokerageUserId: string
    dateToProcess: DateTime
    status: BrokerageJobStatusType
    data?: any
    updatedAt: DateTime
    createdAt: DateTime
}

export interface IbkrAccountCsv {
    Type: string
    AccountID: string
    AccountTitle: string
    Street: string
    Street2: string
    City: string
    State: string
    Zip: string
    Country: string
    AccountType: string
    CustomerType: string
    BaseCurrency: string
    MasterAccountID: string
    Van: string
    Capabilities: string
    Alias: string
    PrimaryEmail: string
    DateOpened: string
    DateClosed: string
    DateFunded: string
    AccountRepresentative: string
}

export type IbkrAccount = {
    userId: string
    accountId: string
    accountProcessDate: DateTime
    type: string | null
    accountTitle: string | null
    street: string | null
    street2: string | null
    city: string | null
    state: string | null
    zip: string | null
    country: string | null
    accountType: string | null
    customerType: string | null
    baseCurrency: string | null
    masterAccountId: string | null
    van: string | null
    capabilities: string | null
    alias: string | null
    primaryEmail: string | null
    dateOpened: DateTime
    dateClosed: DateTime | null
    dateFunded: DateTime | null
    accountRepresentative: string | null
}

export type IbkrAccountTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & IbkrAccount

export type IbkrActivityCsv = {
    Type: string
    AccountID: string
    ConID: string
    SecurityID: string
    Symbol: string
    BBTicker: string
    BBGlobalID: string
    SecurityDescription: string
    AssetType: string
    Currency: string
    BaseCurrency: string
    TradeDate: string
    TradeTime: string
    SettleDate: string
    OrderTime: string
    TransactionType: string
    Quantity: string
    UnitPrice: string
    GrossAmount: string
    SECFee: string
    Commission: string
    Tax: string
    Net: string
    NetInBase: string
    TradeID: string
    TaxBasisElection: string
    Description: string
    FxRateToBase: string
    ContraPartyName: string
    ClrFirmID: string
    Exchange: string
    MasterAccountID: string
    Van: string
    AwayBrokerCommission: string
    OrderID: string
    ClientReference: string
    TransactionID: string
    ExecutionID: string
    CostBasis: string
    Flag: string
}

export type IbkrActivity = {
    type: string | null
    accountId: string
    conId: string | null
    securityId: string | null
    symbol: string | null
    bbTicker: string | null
    bbGlobalId: string | null
    securityDescription: string | null
    assetType: string | null
    currency: string | null
    baseCurrency: string | null
    tradeDate: DateTime | null
    tradeTime: string | null
    settleDate: DateTime | null
    orderTime: DateTime | null
    transactionType: string | null
    quantity: number | null
    unitPrice: number | null
    grossAmount: number | null
    secFee: number | null
    commission: number | null
    tax: number | null
    net: number | null
    netInBase: number | null
    tradeId: string | null
    taxBasisElection: string | null
    description: string | null
    fxRateToBase: number | null
    contraPartyName: string | null
    clrFirmId: string | null
    exchange: string | null
    masterAccountId: string | null
    van: string | null
    awayBrokerCommission: number | null
    orderId: string | null
    clientReferences: string | null
    transactionId: string | null
    executionId: string | null
    costBasis: number | null
    flag: string | null
}

export type IbkrActivityTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & IbkrActivity

export type IbkrCashReportCsv = {
    Type: string
    AccountID: string
    ReportDate: string
    Currency: string
    BaseSummary: string
    Label: string
    Total: string
    Securities: string
    Futures: string
    IBUKL: string
    PAXOS: string
}

export type IbkrCashReport = {
    type: string | null
    accountId: string
    reportDate: DateTime | null
    currency: string | null
    baseSummary: boolean | null
    label: string | null
    total: number | null
    securities: number | null
    futures: number | null
    ibukl: number | null
    paxos: number | null
}

export type IbkrCashReportTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & IbkrCashReport

export type IbkrNavCsv = {
    Type: string
    AccountID: string
    BaseCurrency: string
    Cash: string
    CashCollateral: string
    Stocks: string
    IPOSubscription: string
    SecuritiesBorrowed: string
    SecuritiesLent: string
    Options: string
    Bonds: string
    Commodities: string
    Funds: string
    Notes: string
    Accruals: string
    DividendAccruals: string
    SoftDollars: string
    Crypto: string
    Totals: string
    TWR: string
    CFDUnrealizedPL: string
    ForexCFDUnrealizedPL: string
}

export type IbkrNav = {
    type: string | null
    accountId: string
    baseCurrency: string | null
    cash: number | null
    cashCollateral: number | null
    stocks: number | null
    ipoSubscription: number | null
    securitiesBorrowed: number | null
    securitiesLent: number | null
    options: number | null
    bonds: number | null
    commodities: number | null
    funds: number | null
    notes: number | null
    accruals: number | null
    dividendAccruals: number | null
    softDollars: number | null
    crypto: number | null
    totals: number | null
    twr: number | null
    cfdUnrealizedPl: number | null
    forexCfdUnrealizedPl: number | null
    processedDate: DateTime
}

export type IbkrNavTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & IbkrNav

export type IbkrPlCsv = {
    AccountID: string
    InternalAssetID: string
    SecurityID: string
    Symbol: string
    BBTicker: string
    BBGlobalID: string
    SecurityDescription: string
    AssetType: string
    Currency: string
    ReportDate: string
    PositionMTM: string
    PositionMTMInBase: string
    TransactionMTM: string
    TransactionMTMInBase: string
    RealizedST: string
    RealizedSTInBase: string
    RealizedLT: string
    RealizedLTInBase: string
    UnrealizedST: string
    UnrealizedSTInBase: string
    UnrealizedLT: string
    UnrealizedLTInBase: string
}

export type IbkrPl = {
    accountId: string
    internalAssetId: string
    securityId: string | null
    symbol: string | null
    bbTicker: string | null
    bbGlobalId: string | null
    securityDescription: string | null
    assetType: string | null
    currency: string | null
    reportDate: DateTime
    positionMtm: number | null
    positionMtmInBase: number | null
    transactionMtm: number | null
    transactionMtmInBase: number | null
    realizedSt: number | null
    realizedStInBase: number | null
    realizedLt: number | null
    realizedLtInBase: number | null
    unrealizedSt: number | null
    unrealizedStInBase: number | null
    unrealizedLt: number | null
    unrealizedLtInBase: number | null
}

export type IbkrPlTable = {
    id: number
    updatedAt: DateTime
    creaetdAt: DateTime
} & IbkrPl

export type IbkrPositionCsv = {
    Type: string
    AccountID: string
    ConID: string
    SecurityID: string
    Symbol: string
    BBTicker: string
    BBGlobalID: string
    SecurityDescription: string
    AssetType: string
    Currency: string
    BaseCurrency: string
    Quantity: string
    QuantityInBase: string
    CostPrice: string
    CostBasis: string
    CostBasisInBase: string
    MarketPrice: string
    MarketValue: string
    MarketValueInBase: string
    OpenDateTime: string
    FxRateToBase: string
    ReportDate: string
    SettledQuantity: string
    SettledQuantityInBase: string
    MasterAccountID: string
    Van: string
    AccruedInt: string
    OriginatingOrderID: string
    Multiplier: string
}

export type IbkrPosition = {
    accountId: string
    type: string | null
    conId: string | null
    securityId: string | null
    symbol: string | null
    bbTicker: string | null
    bbGlobalId: string | null
    securityDescription: string | null
    assetType: string | null
    currency: string | null
    baseCurrency: string | null
    quantity: number | null
    quantityInBase: number | null
    costPrice: number | null
    costBasis: number | null
    costBasisInBase: number | null
    marketPrice: number | null
    marketValue: number | null
    marketValueInBase: number | null
    openDateTime: DateTime | null
    fxRateToBase: number | null
    reportDate: DateTime
    settledQuantity: number | null
    settledQuantityInBase: number | null
    masterAccountId: string | null
    van: string | null
    accruedInt: number | null
    originatingOrderId: string | null
    multiplier: number | null
}

export type IbkrPositionTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & IbkrPosition

export type IbkrSecurityCsv = {
    Type: string
    ConID: string
    AssetType: string
    SecurityID: string
    CUSIP: string
    Symbol: string
    BBTicker: string
    BBTickerAndExchangeCode: string
    BBGlobalID: string
    Description: string
    UnderlyingSymbol: string
    UnderlyingCategory: string
    UnderlyingSecurityId: string
    UnderlyingPrimaryExchange: string
    UnderlyingConID: string
    Multiplier: string
    ExpirationDate: string
    OptionType: string
    OptionStrike: string
    MaturityDate: string
    IssueDate: string
    PrimaryExchange: string
    Currency: string
    SubCategory: string
    Issuer: string
    DeliveryMonth: string
}

export type IbkrSecurity = {
    type: string
    conId: string
    assetType: string
    securityId: string
    cusip: string
    symbol: string
    bbTicker: string | null
    bbTickerAndExchangeCode: string | null
    bbGlobalId: string | null
    description: string | null
    underlyingSymbol: string | null
    underlyingCategory: string | null
    underlyingSecurityId: string | null
    underlyingPrimaryExchange: string | null
    underlyingConId: string | null
    multiplier: number | null
    expirationDate: DateTime | null
    optionType: string | null
    optionStrike: number | null
    maturityDate: DateTime | null
    issueDate: DateTime | null
    primaryExchange: string | null
    currency: string | null
    subCategory: string | null
    issuer: string | null
    deliveryMonth: string | null
}

export type IbkrSecurityTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & IbkrSecurity