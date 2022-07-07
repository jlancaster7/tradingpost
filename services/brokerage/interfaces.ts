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

export type TradingPostCurrentHoldingsTable = {
    id: string
    account_id: string
    security_id: string
    security_type: SecurityType
    price: number
    price_as_of: DateTime | null
    price_source: string
    value: number
    costBasis: number | null
    quantity: number
    currency: string
    created_at: DateTime
    updated_at: DateTime 
}

export type TradingPostHistoricalHoldingsTable = {
    id: string
    account_id: string
    security_id: string
    security_type: SecurityType
    price: number
    price_as_of: DateTime | null
    price_source: string
    value: number
    cost_basis: number | null
    quantity: number
    currency: string
    date: DateTime
    created_at: DateTime
    updated_at: DateTime 
}

export type TradingPostCustomIndustryTable = {
    id: string
    user_id: string
    security_id: string
    industry: string
    created_at: DateTime
    updated_at: DateTime
}

export type TradingPostTransactionTable = {
    id: string
    account_id: string
    security_id: string
    security_type: SecurityType
    date: DateTime
    quantity: number
    price: number
    amount: number
    fees: number | null
    type: InvestmentTransactionType
    currency: string
    created_at: DateTime
    updated_at: DateTime
}

export enum SecurityType {
    equity = "equity",
    option = "option",
    index = "index",
    mutualFund = "mutualFund",
    cashEquivalent = "cashEquivalent", // A money market fund would be an example of a cash equivalent
    fixedIncome = "fixedIncome",
    currency = "currency"
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

export type TradingPostAccountTable = {
    id: string // account_id else where
    user_id: string
    broker_name: string
    mask: string | null
    name: string
    official_name: string | null
    type: string // Margin or Cash Account
    subtype: string | null
    created_at: DateTime
    updated_at: DateTime
}

export type TradingPostAccountGroupTable = {
    id: string
    name: string // all accounts under 'default'
    account_group_id: string
    user_id: string
    account_id: string
    default_benchmark_id: string // References securities table
    created_at: DateTime
    updated_at: DateTime
}

export type TradingPostPortfolioSummaryTable = {
    id: string
    account_group_id: string
    beta: number
    sharpe: number
    industry_allocation: {[key: string]: number}
    exposure: {
        long: number
        short: number
        net: number
        gross: number
    }
    date: DateTime
    benchmark_id: number // References securities table
    created_at: DateTime
    updated_at: DateTime
}



export type BenchmarkHoldingPeriodReturnTable = {
    id: number
    security_id: number
    date: DateTime
    return: number
    created_at: DateTime
    updated_at: DateTime
}

export type AccountGroupHoldingPeriodReturnTable = {
    id: number
    account_group_id: string
    date: DateTime
    return: number
    created_at: DateTime
    updated_at: DateTime
}


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