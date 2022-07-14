import {DateTime} from "luxon";
import {QueryArrayConfig, QueryArrayResult, QueryConfig, QueryResult, QueryResultRow, Submittable} from "pg";

export interface addSecurityPrice {
    securityId: number
    price: number
    time: Date
}

export interface upsertSecuritiesInformation {
    securityId: number
    calculationPrice: string | null
    delayedPrice: number | null
    delayedPriceTime: number | null
    oddLotDelayedPrice: number | null
    oddLotDelayedPriceTime: number | null
    extendedPrice: number | null
    extendedChange: number | null
    extendedChangePercent: number | null
    extendedPriceTime: number | null
    previousClose: number | null
    previousVolume: number | null
    avgTotalVolume: number | null
    marketCap: number | null
    peRatio: number | null
    week52High: number | null
    week52Low: number | null
    ytdChange: number | null
    lastTradeTime: number | null
    currency: string | null
    close: number | null
    high: number | null
    low: number | null
    open: number | null
    volume: number | null
    marketChangeOverTime: number | null
    unadjustedOpen: number | null
    unadjustedClose: number | null
    unadjustedLow: number | null
    unadjustedVolume: number | null
    fullyAdjustedOpen: number | null
    fullyAdjustedClose: number | null
    fullyAdjustedLow: number | null
    fullyAdjustedVolume: number | null
    label: string | null
    change: number | null
    changePercent: number | null
    week52HighSplitAdjustOnly: number | null
    week52LowSplitAdjustOnly: number | null
    week52Change: number | null
    sharesOutstanding: number | null
    float: number | null
    avg10Volume: number | null
    avg30Volume: number | null
    day200MovingAvg: number | null
    day50MovingAvg: number | null
    employees: number | null
    ttmEps: number | null
    ttmDividendRate: number | null
    dividendYield: number | null
    nextDividendDate: string | null
    exDividendDate: string | null
    nextEarningsDate: string | null
    beta: number | null
    maxChangePercent: number | null
    year5ChangePercent: number | null
    year2ChangePercent: number | null
    year1ChangePercent: number | null
    ytdChangePercent: number | null
    month6ChangePercent: number | null
    month3ChangePercent: number | null
    month1ChangePercent: number | null
    day30ChangePercent: number | null
    day5ChangePercent: number | null
}

export interface addExchange {
    name: string
    mic: string
    longName?: string
    tapeId?: string
    oatsId?: string
    refId?: string
    type?: string
    region?: string
    description?: string
    segment?: string
    segmentDescription?: string
    suffix?: string
    exchangeSuffix?: string
}

export interface getExchange {
    id: number
    name: string
    mic: string
    longName?: string
    tapeId?: string
    oatsId?: string
    refId?: string
    type?: string
    region?: string
    description?: string
    segment?: string
    segmentDescription?: string
    suffix?: string
    exchangeSuffix?: string
    lastUpdated?: Date
    createdAt?: Date
}

export interface addUSHoliday {
    date: Date
    settlementDate: Date | null
}

export interface getUSExchangeHoliday {
    id: number
    date: DateTime
    settlementDate: DateTime
    CreatedAt: DateTime
}

export interface getSecurityWithLatestPrice {
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
    lastUpdated: DateTime
    createdAt: DateTime
    latestTime: DateTime
    latestPrice: number
}

export interface getSecurityBySymbol {
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

export interface getIexSecurityBySymbol extends getSecurityBySymbol {
    validated: boolean
}

export interface addSecurity {
    symbol: string
    companyName: string
    exchange: string | null
    industry: string | null
    website: string | null
    description: string | null
    ceo: string | null
    securityName: string | null
    issueType: string | null
    sector: string | null
    primarySicCode: string | null
    employees: string | null
    tags: string[] | null
    address: string | null
    address2: string | null
    state: string | null
    zip: string | null
    country: string | null
    phone: string | null
    logoUrl: string | null
}

export interface addIexSecurity extends addSecurity {
    validated: boolean
}

export interface addSecurityResponse {
    id: number
    symbol: string
}

export interface IDatabaseClient {
    clean(): Promise<number | undefined>

    connect(): Promise<void>

    query<T extends Submittable>(queryStream: T): T;

    // tslint:disable:no-unnecessary-generics
    query<R extends any[] = any[], I extends any[] = any[]>(
        queryConfig: QueryArrayConfig<I>,
        values?: I,
    ): Promise<QueryArrayResult<R>>;

    query<R extends QueryResultRow = any, I extends any[] = any[]>(
        queryConfig: QueryConfig<I>,
    ): Promise<QueryResult<R>>;

    query<R extends QueryResultRow = any, I extends any[] = any[]>(
        queryTextOrConfig: string | QueryConfig<I>,
        values?: I,
    ): Promise<QueryResult<R>>;

    end(): Promise<any>

    on(...args: any[]): void
}
