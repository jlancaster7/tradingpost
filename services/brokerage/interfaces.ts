import {DateTime} from "luxon";

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

export interface IProvider {
    exportAccounts(): Promise<any>

    exportTransactions(): Promise<any>

    exportHoldings(): Promise<any>
}

export interface IRepository {
    getRealizefiUser(request: { tpUserId?: string, realizefiUserId?: string }): Promise<RealizefiUser | null>

    addRealizefiUser(realizefiUserId: string): Promise<RealizefiUser>

    getRealizefiAccounts(userId: string): Promise<RealizefiAccount[]>

    addRealizefiAccounts(realizeAccounts: RealizefiAccount[]): Promise<void>

    getRealizefiAccountTransactions(userId: string): Promise<RealizefiAccountTransaction[]>

    addRealizefiAccountTransactions(accountTransactions: RealizefiAccountTransaction[]): Promise<void>

    getRealizefiAccountPositions(userId: string): Promise<RealizefiAccountPosition[]>

    addRealizefiAccountPositions(accountPositions: RealizefiAccountPosition[]): Promise<void>
}

export type ImportOpts = {
    returnUpdates: boolean
}

export type RealizefiUser = {
    id: number | null
    realizefiId: string
}

export type RealizefiAccount = {
    id: number | null
    accountId: number
    realizefiInstitutionId: string
    institution: string
    accountNumber: string
    healthStatus: string
    permissionScopes: JSONValue
    buyingPower: number
    cash: number
    accountValue: number
    margin: number
}

export type RealizefiAccountTransaction = {
    id: number | null
    accountId: number
    realizefiTransactionId: string
    transactionDate: DateTime | null
    settlementDate: DateTime | null
    transactionType: string
    netAmount: number | null
    transactionTypeDetail: string | null
    transactionSubTypeDetail: string | null
    side: string | null
    quantity: number | null
    price: number | null
    adjustmentRatio: number | null
    instrument: {} | null
    symbol: string | null
    fees: number | null
}

export type RealizefiAccountPosition = {
    id: number | null
    accountId: number
    symbol: string
    averagePrice: number
    costBasis: number
    longQuantity: number
    shortQuantity: number
    marketValue: number
    currentDayProfitLoss: number
    currentDayProfitLossPercentage: number
    securityType: string
    securityId: string
    securitySymbol: string
    securityShareClassFigi: string
    securityCompositeFigi: string
    securityStrikePrice: number | null
    securityExpiration: DateTime | null
    securityContractType: string | null
    securityPrimaryExchange: string
}

export type TableInfo = {
    id: number
    created_at: DateTime
    updated_at: DateTime
}

export type TradingPostCurrentHoldings = {
    account_id: number
    security_id: number
    security_type: SecurityType | null
    price: number
    price_as_of: DateTime
    price_source: string
    value: number
    cost_basis: number | null
    quantity: number
    currency: string | null
}

export type TradingPostCurrentHoldingsTable = TradingPostCurrentHoldings & TableInfo;


export type TradingPostHistoricalHoldings = {
    account_id: number
    security_id: number
    security_type: SecurityType | null
    price: number
    price_as_of: DateTime
    price_source: string
    value: number
    cost_basis: number | null
    quantity: number
    currency: string | null
    date: DateTime
}

export type TradingPostHistoricalHoldingsTable = TradingPostHistoricalHoldings & TableInfo;

export type HistoricalHoldings = {
    account_id?: number,
    account_group_id?: number,
    security_id: number
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
    user_id: string
    security_id: number
    industry: string
}

export type TradingPostCustomIndustryTable = TradingPostCustomIndustry & TableInfo;

export type TradingPostTransactions = {
    account_id: number
    security_id: number
    security_type: SecurityType
    date: DateTime
    quantity: number
    price: number
    amount: number
    fees: number | null
    type: InvestmentTransactionType
    currency: string
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
    transfer = "transfer",
    dividendOrInerest = "dividendOrInterest"
}

export type TradingPostAccounts = {
    user_id: string
    broker_name: string
    mask: string | null
    name: string
    official_name: string | null
    type: string // Margin or Cash Account
    subtype: string | null
}

export type TradingPostAccountsTable = TradingPostAccounts & TableInfo;

export type TradingPostAccountGroups = {
    name: string // all accounts under 'default'
    account_group_id: number
    user_id: string
    account_id: number
    default_benchmark_id: number // References securities table
}

export type TradingPostAccountGroupsTable = TradingPostAccountGroups & TableInfo;

export type TradingPostAccountGroupStats = {
    account_group_id: number
    beta: number
    sharpe: number
    industry_allocation: TradingPostSectorAllocations[]
    exposure: TradingPostExposure
    date: DateTime
    benchmark_id: number // References securities table
}

export type TradingPostAccountGroupStatsTable = TradingPostAccountGroupStats & TableInfo;

export type SecurityPrices = {
    security_id: number
    date: DateTime
    price: number
}

export type SecurityPricesTable = SecurityPrices & {id: number, created_at: DateTime}; 

export type SecurityHPRs = {

    security_id: number
    date: DateTime
    return: number
}

export type SecurityHPRsTable = SecurityHPRs & TableInfo;

export type AccountGroupHPRs = {
    account_group_id: number
    date: DateTime
    return: number
}

export type AccountGroupHPRsTable = AccountGroupHPRs & TableInfo;

interface SomeInterface<U> {
    id: number
    transaction: string
    transactionType: U
    details: U extends "a" ? {name: string} : null
}

// Could conditional type
// Need to do nested ternary operator
// type guards functions that you write that ensure that a value is something
const ensureT = (data: any): data is Record<number, string> => {
    return true
}

const X: any = "hello";

if (ensureT(X)) {
    X
}

type U = "a" | "b" | "c"