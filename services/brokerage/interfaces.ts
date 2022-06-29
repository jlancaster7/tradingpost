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

export type TradingPostHolding = {}

export type TradingPostTransaction = {}

export type TradingPostAccount = {}

export type TradingPostPortfolioSummary = {
    id: number
    beta: number
    sharpe: number
    etc: number
    default_benchmark_id: number // References securities table
}

export type BenchmarkHoldingPeriodReturnTable = {
    id: number
    security_id: number
    price: number
    timestamp: DateTime
}

export type PortfolioHoldingPeriodReturnTable = {
    id: number
    portfolio_id: number | null
    timestamp: DateTime
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