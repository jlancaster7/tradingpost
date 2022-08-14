import { Response } from 'node-fetch';
export declare class IEXError extends Error {
    iexMessage: string;
    statusCode: number;
    constructor(message: string, iexMessage: string, statusCode: number);
}
export declare class RetryError extends Error {
    constructor(message?: string);
}
export declare const ProductionBaseURL = "https://cloud.iexapis.com/v1";
export declare const SandboxBaseURL = "https://sandbox.iexapis.com";
export interface HTTPConfiguration {
    method: string;
    headers?: Record<string, string>;
    body?: any;
}
export interface GetStatus {
    status: string;
    version: string;
    time: number;
    currentMonthAPICalls: number;
}
export interface GetCompany {
    symbol: string;
    companyName: string;
    exchange: string;
    industry: string;
    website: string;
    description: string;
    CEO: string;
    securityName: string;
    issueType: string;
    sector: string;
    primarySicCode: number;
    employees: number;
    tags: string[];
    address: string;
    address2: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
}
export interface GetDelayedQuote {
    symbol: string;
    delayedPrice: string;
    delayedSize: number;
    delayedPriceTime: number;
    high: number;
    low: number;
    totalVolume: number;
    processedTime: number;
}
export interface GetDividendsBasic {
    amount: number;
    currency: string;
    declaredDate: string;
    description: string;
    exDate: string;
    flag: string;
    frequency: string;
    paymentDate: string;
    recordDate: string;
    refid: number;
    symbol: string;
    id: string;
    key: string;
    subkey: string;
    date: number;
    updated: number;
}
export interface GetHistoricalPrice {
    close: number;
    high: number;
    low: number;
    open: number;
    symbol: string;
    volume: number;
    id: string;
    key: string;
    date: string;
    updated: number;
    changeOverTime: number;
    marketChangeOverTime: number;
    uOpen: number;
    uClose: number;
    uHigh: number;
    uLow: number;
    uVolume: number;
    fOpen: number;
    fClose: number;
    fHigh: number;
    fLow: number;
    fVolume: number;
    label: string;
    change: number;
    changePercent: number;
}
export interface HistoricalPriceRangeQueryParams {
    chartCloseOnly?: boolean;
    chartByDay?: boolean;
    chartSimplify?: boolean;
    chartInterval?: number;
    changeFromClose?: boolean;
    chartLast?: number;
    displayPercent?: boolean;
    range?: HistoricalPriceRange;
    exactDate?: string;
    sort?: string;
    includeToday?: boolean;
}
export interface GetLogo {
    url: string;
}
export interface GetOHLC {
    open: {
        price: number;
        time: number;
    };
    close: {
        price: number;
        time: number;
    };
    high: number;
    low: number;
}
export interface GetPreviousDayPrice {
    close: number;
    high: number;
    low: number;
    open: number;
    symbol: string;
    volume: number;
    id: string;
    key: string;
    subkey: string;
    date: string;
    updated: number;
    changeOverTime: number;
    marketChangeOverTime: number;
    uOpen: number;
    uClose: number;
    uHigh: number;
    uLow: number;
    uVolume: number;
    fOpen: number;
    fClose: number;
    fHigh: number;
    fLow: number;
    fVolume: number;
    label: string;
    change: number;
    changePercent: number;
}
export interface GetQuote {
    symbol: string;
    companyName: string;
    primaryExchange: string;
    calculationPrice: string;
    open: number;
    openTime: number;
    openSource: string;
    close: number;
    closeTime: number;
    closeSource: string;
    high: number;
    highTime: number;
    highSource: string;
    low: number;
    lowTime: number;
    lowSource: string;
    latestPrice: number;
    latestSource: string;
    latestTime: string;
    latestUpdate: number;
    latestVolume: number;
    iexRealtimePrice: number;
    iexRealtimeSize: number;
    iexLastUpdated: number;
    delayedPrice: number;
    delayedPriceTime: number;
    oddLotDelayedPrice: number;
    oddLotDelayedPriceTime: number;
    extendedPrice: number;
    extendedChange: number;
    extendedChangePercent: number;
    extendedPriceTime: number;
    previousClose: number;
    previousVolume: number;
    change: number;
    changePercent: number;
    volume: number;
    iexMarketPercent: number;
    iexVolume: number;
    avgTotalVolume: number;
    iexBidPrice: number;
    iexBidSize: number;
    iexAskPrice: number;
    iexAskSize: number;
    iexOpen: number;
    iexOpenTime: number;
    iexClose: number;
    iexCloseTime: number;
    marketCap: number;
    peRatio: number;
    week52High: number;
    week52Low: number;
    ytdChange: number;
    lastTradeTime: number;
    currency: string;
    isUSMarketOpen: boolean;
}
export declare type HistoricalPriceRange = 'max' | '5y' | '2y' | '1y' | 'ytd' | '6m' | '3m' | '1m' | '1mm' | '5d' | '5dm' | 'dynamic';
export declare type BulkTypes = 'balance-sheet' | 'book' | 'cash-flow' | 'ceo-compensation' | 'chart' | 'intraday-prices' | 'logo' | 'ohlc' | 'previous' | 'quote' | 'splits' | "company" | "stats";
export interface GetIntraDayPrices {
    date: string;
    minute: string;
    label: string;
    marketOpen: number;
    marketClose: number;
    marketHigh: number;
    marketLow: number;
    marketAverage: number;
    marketVolume: number;
    marketNotional: number;
    marketNumberOfTrades: number;
    marketChangeOverTime: number;
    high: number | null;
    low: number | null;
    open: number | null;
    close: number | null;
    average: number;
    volume: number;
    notional: number;
    numberOfTrades: number;
    changeOverTime: number;
}
export interface GetIntraDayPricesQueryParameters {
    chartIEXOnly?: boolean;
    chartReset?: boolean;
    chartSimplify?: boolean;
    chartInterval?: number;
    changeFromClose?: boolean;
    chartLast?: number;
    exactDate?: string;
    chartIEXWhenNull?: boolean;
}
export interface GetSplitsBasic {
    declaredDate: string;
    description: string;
    exDate: string;
    fromFactor: number;
    ratio: number;
    refid: number;
    symbol: string;
    toFactor: number;
    id: string;
    key: string;
    subkey: string;
    date: number;
    updated: number;
}
export declare type GetSplitsBasicRange = "5y" | "2y" | "1y" | "ytd" | "6m" | "3m" | "1m" | "next";
export interface GetStatsBasic {
    companyName: string;
    marketcap: number;
    week52high: number;
    week52low: number;
    week52highSplitAdjustOnly: number;
    week52lowSplitAdjustOnly: number;
    week52change: number;
    sharesOutstanding: number;
    float: number;
    avg10Volume: number;
    avg30Volume: number;
    day200MovingAvg: number;
    day50MovingAvg: number;
    employees: number;
    ttmEPS: number;
    ttmDividendRate: number;
    dividendYield: number;
    nextDividendDate: string;
    exDividendDate: string;
    nextEarningsDate: string;
    peRatio: number;
    beta: number;
    maxChangePercent: number;
    year5ChangePercent: number;
    year2ChangePercent: number;
    year1ChangePercent: number;
    ytdChangePercent: number;
    month6ChangePercent: number;
    month3ChangePercent: number;
    month1ChangePercent: number;
    day30ChangePercent: number;
    day5ChangePercent: number;
}
export interface GetIntradayPriceSupportedSymbols {
    symbol: string;
    name: string;
    date: string;
    type: string;
    iexId: string;
    region: string;
    currency: string;
    isEnabled: boolean;
    figi: string;
    cik: string;
}
export interface GetIexSymbols {
    symbol: string;
    date: string;
    isEnabled: boolean;
}
export interface GetOtcSymbols {
    symbol: string;
    exchange: string;
    exchangeSuffix: string;
    exchangeName: string;
    exchangeSegment: string;
    exchangeSegmentName: string;
    name: string;
    date: string;
    type: string;
    iexId: string;
    region: string;
    currency: string;
    isEnabled: boolean;
    figi: string;
    cik: string;
    lei: string;
}
export interface GetUsExchanges {
    mic: string;
    name: string;
    longName: string;
    tapeId: string;
    oatsId: string;
    refId: string;
    type: string;
}
export interface GetExchanges {
    exchange: string;
    region: string;
    description: string;
    mic: string;
    segment: string;
    segmentDescription: string;
    suffix: string;
    exchangeSuffix: string;
}
export interface GetUSHolidayAndTradingDays {
    date: string;
    settlementDate?: string;
}
export default class IEX {
    private readonly baseURL;
    private readonly token;
    private readonly retryMax;
    constructor(token: string, baseURL?: string, retryMax?: number);
    fetch: (endpoint: string, httpConfiguration: HTTPConfiguration, queryParameters?: Record<string, any> | undefined) => Promise<any>;
    retry: (fn: () => Promise<Response>, retryNum: number) => Promise<Response>;
    getCompany: (symbol: string) => Promise<GetCompany>;
    getStatus: () => Promise<GetStatus>;
    /**
     * Returns 15 minute delayed market quote
     */
    getDelayedQuote: (symbol: string) => Promise<GetDelayedQuote>;
    /**
     *  Provides basic dividend data for us equities, etfs, and mutual funds for the last 5 years.
     * @param symbol
     * @param range
     */
    getDividendsBasic: (symbol: string, range?: string) => Promise<GetDividendsBasic>;
    /**
     * Returns adjusted and unadjusted historical data for up to 15 years, and historical minute-by-minute intraday
     * prices for the last 30 trailing calendar days.
     * @param symbol
     * @param queryParameters
     */
    getHistoricalPrices: (symbol: string, queryParameters?: HistoricalPriceRangeQueryParams) => Promise<GetHistoricalPrice[]>;
    /**
     *
     * @param symbol
     */
    getLogo: (symbol: string) => Promise<GetLogo>;
    /**
     * Returns the official open and close for a given symbol. The official open is available as soon as 9:45am ET and
     * the official close as soon as 4:15pm ET. Some stocks can report late open, or close prices.
     * @param symbol
     */
    getOHLC: (symbol: string) => Promise<GetOHLC>;
    /**
     * Returns previous day adjusted price data for one or more stocks
     * @param symbol
     */
    getPreviousDayPrice: (symbol: string) => Promise<GetPreviousDayPrice>;
    /**
     * All response attributes related to 15 minute delayed market-wide price data are only available to paid plans
     * @param symbol
     */
    getQuote: (symbol: string) => Promise<GetQuote>;
    /**
     * Returns aggregated intra-day prices in one-minute buckets for the current day
     * @param symbol
     * @param queryParameters
     */
    getIntraDayPrices: (symbol: string, queryParameters?: GetIntraDayPricesQueryParameters) => Promise<GetIntraDayPrices[]>;
    /**
     * Company stock splits...
     * @param symbol
     * @param range
     */
    getSplitsBasic: (symbol: string, range?: GetSplitsBasicRange) => Promise<GetSplitsBasic[]>;
    /**
     * KEy stats about a company
     * @param symbol
     */
    getStatsBasic: (symbol: string) => Promise<GetStatsBasic>;
    /**
     * This refdata endpoint returns the list of symbols that IEX Cloud supports for intraday price updates
     */
    getIntraDaySupportedSymbols: () => Promise<GetIntradayPriceSupportedSymbols[]>;
    /**
     * This call returns an array of symbols the investors exchange supports for trading. This list is updated daily at
     * 7:45am ET. Symbols may be added or removed by the investors exchange after the list was produced.
     */
    getIexSymbols: () => Promise<GetIexSymbols[]>;
    /**
     * This call returns an array of OTC symbols that IEX Cloud supports for API calls.
     */
    getOtcSymbols: () => Promise<GetOtcSymbols[]>;
    /**
     * Returns an array of exchanges
     */
    getUsExchanges: () => Promise<GetUsExchanges[]>;
    /**
     * Returns an array of exchanges
     */
    getInternationalExchanges: () => Promise<GetExchanges[]>;
    /**
     * Start date format is YYMMDD
     * TODO: Maybe swap out startdate for an actual timestamp type
     * @param type
     * @param direction
     * @param last
     * @param startDate
     */
    getUSHolidayAndTradingDays: (type: "trade" | "holiday", direction?: "next" | "last", last?: number, startDate?: string | undefined) => Promise<GetUSHolidayAndTradingDays[]>;
    bulk: (symbols: string[], types: BulkTypes[], queryParams?: object | undefined) => Promise<Record<string, any>>;
}
