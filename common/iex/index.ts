import fetch, {Response} from 'node-fetch';
import {sleep} from "../utils/sleep";
import {URL} from 'url';

export class IEXError extends Error {
    public iexMessage: string;
    public statusCode: number;

    constructor(message: string, iexMessage: string, statusCode: number) {
        super(message);
        this.iexMessage = iexMessage;
        this.statusCode = statusCode
    }
}

export class RetryError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class PermissionRequiredError extends Error {
    constructor(msg?: string) {
        super(msg);
    }
}

export const ProductionBaseURL = "https://cloud.iexapis.com/v1";
export const SandboxBaseURL = "https://sandbox.iexapis.com";

export interface HTTPConfiguration {
    method: string
    headers?: Record<string, string>
    body?: any
}

const HTTPConfigurationDefaults = {
    method: "GET"
}

export interface GetStatus {
    status: string
    version: string
    time: number
    currentMonthAPICalls: number
}

export interface GetCompany {
    symbol: string
    companyName: string
    exchange: string
    industry: string
    website: string
    description: string
    CEO: string
    securityName: string
    issueType: string
    sector: string
    primarySicCode: number
    employees: number
    tags: string[]
    address: string
    address2: string
    state: string
    zip: string
    country: string
    phone: string
}

export interface GetDelayedQuote {
    symbol: string
    delayedPrice: string
    delayedSize: number
    delayedPriceTime: number
    high: number
    low: number
    totalVolume: number
    processedTime: number
}

export interface GetDividendsBasic {
    amount: number
    currency: string
    declaredDate: string
    description: string
    exDate: string
    flag: string
    frequency: string
    paymentDate: string
    recordDate: string
    refid: number
    symbol: string
    id: string
    key: string
    subkey: string
    date: number
    updated: number
}

export interface GetHistoricalPrice {
    close: number
    high: number
    low: number
    open: number
    symbol: string
    volume: number
    id: string
    key: string
    date: string
    updated: number
    changeOverTime: number
    marketChangeOverTime: number
    uOpen: number
    uClose: number
    uHigh: number
    uLow: number
    uVolume: number
    fOpen: number
    fClose: number
    fHigh: number
    fLow: number
    fVolume: number
    label: string
    change: number
    changePercent: number
}

export interface HistoricalPriceRangeQueryParams {
    chartCloseOnly?: boolean
    chartByDay?: boolean
    chartSimplify?: boolean
    chartInterval?: number
    changeFromClose?: boolean
    chartLast?: number
    displayPercent?: boolean
    range?: HistoricalPriceRange
    exactDate?: string
    sort?: string
    includeToday?: boolean
}

export interface GetLogo {
    url: string
}

export interface GetOHLC {
    open: {
        price: number
        time: number
    }
    close: {
        price: number
        time: number
    }
    high: number
    low: number
}

export interface GetPreviousDayPrice {
    close: number
    high: number
    low: number
    open: number
    symbol: string
    volume: number
    id: string
    key: string
    subkey: string
    date: string
    updated: number
    changeOverTime: number
    marketChangeOverTime: number
    uOpen: number
    uClose: number
    uHigh: number
    uLow: number
    uVolume: number
    fOpen: number
    fClose: number
    fHigh: number
    fLow: number
    fVolume: number
    label: string
    change: number
    changePercent: number
}

export interface GetQuote {
    symbol: string
    companyName: string
    primaryExchange: string
    calculationPrice: string
    open: number
    openTime: number
    openSource: string
    close: number
    closeTime: number
    closeSource: string
    high: number
    highTime: number
    highSource: string
    low: number
    lowTime: number
    lowSource: string
    latestPrice: number
    latestSource: string
    latestTime: string
    latestUpdate: number
    latestVolume: number
    iexRealtimePrice: number
    iexRealtimeSize: number
    iexLastUpdated: number
    delayedPrice: number
    delayedPriceTime: number
    oddLotDelayedPrice: number
    oddLotDelayedPriceTime: number
    extendedPrice: number
    extendedChange: number
    extendedChangePercent: number
    extendedPriceTime: number
    previousClose: number
    previousVolume: number
    change: number
    changePercent: number
    volume: number
    iexMarketPercent: number
    iexVolume: number
    avgTotalVolume: number
    iexBidPrice: number
    iexBidSize: number
    iexAskPrice: number
    iexAskSize: number
    iexOpen: number
    iexOpenTime: number
    iexClose: number
    iexCloseTime: number
    marketCap: number
    peRatio: number
    week52High: number
    week52Low: number
    ytdChange: number
    lastTradeTime: number
    currency: string
    isUSMarketOpen: boolean
}

export type HistoricalPriceRange =
    'max'
    | '5y'
    | '2y'
    | '1y'
    | 'ytd'
    | '6m'
    | '3m'
    | '1m'
    | '1mm'
    | '5d'
    | '5dm'
    | 'dynamic'

export type BulkTypes = 'balance-sheet' | 'book' | 'cash-flow' | 'ceo-compensation' | 'chart' | 'intraday-prices' |
    'logo' | 'ohlc' | 'previous' | 'quote' | 'splits' | "company" | "stats"

export interface GetIntraDayPrices {
    date: string
    minute: string
    label: string
    marketOpen: number
    marketClose: number
    marketHigh: number
    marketLow: number
    marketAverage: number
    marketVolume: number
    marketNotional: number
    marketNumberOfTrades: number
    marketChangeOverTime: number
    high: number | null
    low: number | null
    open: number | null
    close: number | null
    average: number
    volume: number
    notional: number
    numberOfTrades: number
    changeOverTime: number
}

export interface GetIntraDayPricesQueryParameters {
    chartIEXOnly?: boolean
    chartReset?: boolean
    chartSimplify?: boolean
    chartInterval?: number
    changeFromClose?: boolean
    chartLast?: number
    exactDate?: string
    chartIEXWhenNull?: boolean
}

export interface GetSplitsBasic {
    declaredDate: string
    description: string
    exDate: string
    fromFactor: number
    ratio: number
    refid: number
    symbol: string
    toFactor: number
    id: string
    key: string
    subkey: string
    date: number
    updated: number
}

export type GetSplitsBasicRange = "5y" | "2y" | "1y" | "ytd" | "6m" | "3m" | "1m" | "next"

export interface GetStatsBasic {
    companyName: string
    marketcap: number
    week52high: number
    week52low: number
    week52highSplitAdjustOnly: number
    week52lowSplitAdjustOnly: number
    week52change: number
    sharesOutstanding: number
    float: number
    avg10Volume: number
    avg30Volume: number
    day200MovingAvg: number
    day50MovingAvg: number
    employees: number
    ttmEPS: number
    ttmDividendRate: number
    dividendYield: number
    nextDividendDate: string
    exDividendDate: string
    nextEarningsDate: string
    peRatio: number
    beta: number
    maxChangePercent: number
    year5ChangePercent: number
    year2ChangePercent: number
    year1ChangePercent: number
    ytdChangePercent: number
    month6ChangePercent: number
    month3ChangePercent: number
    month1ChangePercent: number
    day30ChangePercent: number
    day5ChangePercent: number
}

export interface GetIntradayPriceSupportedSymbols {
    symbol: string
    name: string
    date: string
    type: string
    iexId: string
    region: string
    currency: string
    isEnabled: boolean
    figi: string
    cik: string
}

export interface GetIexSymbols {
    symbol: string
    date: string
    isEnabled: boolean
}

export interface GetOtcSymbols {
    symbol: string
    exchange: string
    exchangeSuffix: string
    exchangeName: string
    exchangeSegment: string
    exchangeSegmentName: string
    name: string
    date: string
    type: string
    iexId: string
    region: string
    currency: string
    isEnabled: boolean
    figi: string
    cik: string
    lei: string
}

export interface GetUsExchanges {
    mic: string
    name: string
    longName: string
    tapeId: string
    oatsId: string
    refId: string
    type: string
}

export interface GetExchanges {
    exchange: string
    region: string
    description: string
    mic: string
    segment: string
    segmentDescription: string
    suffix: string
    exchangeSuffix: string
}

export interface GetUSHolidayAndTradingDays {
    date: string
    settlementDate?: string
}

export default class IEX {
    readonly baseURL: string;
    readonly token: string;
    readonly retryMax: number;

    constructor(token: string, baseURL: string = ProductionBaseURL, retryMax: number = 3) {
        this.token = token;
        this.baseURL = baseURL;
        this.retryMax = retryMax;
    }

    fetch = async (endpoint: string, httpConfiguration: HTTPConfiguration, queryParameters?: Record<string, any>): Promise<any> => {
        let url = new URL(this.baseURL)
        url.pathname += endpoint;
        if (queryParameters != null) {
            for (let k in queryParameters) {
                const v = queryParameters[k];
                url.searchParams.set(k, v);
            }
        }

        const config = {...HTTPConfigurationDefaults, ...httpConfiguration};
        return await fetch(url.toString(), config);
    }

    retry = async (fn: () => Promise<Response>, retryNum: number): Promise<Response> => {
        let err = null;
        for (let i = 0; i < retryNum; i++) {
            try {
                return await fn();
            } catch
                (e) {
                if (e instanceof RetryError) {
                    const sleepMilli = 60 * i
                    await sleep(sleepMilli);
                    continue
                }
                throw e
            }
        }
        throw err
    }

    getCompany = async (symbol: string): Promise<GetCompany> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/company`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()

            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetCompany
    }

    getStatus = async (): Promise<GetStatus> => {
        const response = await this.retry(async () => {
            const response = await this.fetch("/status", {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()

            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetStatus
    }

    /**
     * Returns 15 minute delayed market quote
     */
    getDelayedQuote = async (symbol: string): Promise<GetDelayedQuote> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/delayed-quote`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetDelayedQuote
    }

    /**
     *  Provides basic dividend data for us equities, etfs, and mutual funds for the last 5 years.
     * @param symbol
     * @param range
     */
    getDividendsBasic = async (symbol: string, range: string = "next"): Promise<GetDividendsBasic> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/dividends/${range}`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetDividendsBasic
    }

    /**
     * Returns adjusted and unadjusted historical data for up to 15 years, and historical minute-by-minute intraday
     * prices for the last 30 trailing calendar days.
     * @param symbol
     * @param queryParameters
     */
    getHistoricalPrices = async (symbol: string, queryParameters: HistoricalPriceRangeQueryParams = {range: '1y'}): Promise<GetHistoricalPrice[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/chart`, {
                method: "GET",
            }, {
                ...queryParameters,
                "token": this.token,
            });
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetHistoricalPrice[]
    }

    /**
     *
     * @param symbol
     */
    getLogo = async (symbol: string): Promise<GetLogo> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/logo`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetLogo
    }

    /**
     * Returns the official open and close for a given symbol. The official open is available as soon as 9:45am ET and
     * the official close as soon as 4:15pm ET. Some stocks can report late open, or close prices.
     * @param symbol
     */
    getOHLC = async (symbol: string): Promise<GetOHLC> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/ohlc`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetOHLC
    }

    /**
     * Returns previous day adjusted price data for one or more stocks
     * @param symbol
     */
    getPreviousDayPrice = async (symbol: string): Promise<GetPreviousDayPrice> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/previous`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetPreviousDayPrice
    }

    /**
     * All response attributes related to 15 minute delayed market-wide price data are only available to paid plans
     * @param symbol
     */
    getQuote = async (symbol: string): Promise<GetQuote> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/quote`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetQuote
    }

    /**
     * Returns aggregated intra-day prices in one-minute buckets for the current day
     * @param symbol
     * @param queryParameters
     */
    getIntraDayPrices = async (symbol: string, queryParameters: GetIntraDayPricesQueryParameters = {}): Promise<GetIntraDayPrices[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/intraday-prices`, {
                method: "GET",
            }, {
                ...queryParameters,
                "token": this.token
            });
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetIntraDayPrices[]
    }

    /**
     * Company stock splits...
     * @param symbol
     * @param range
     */
    getSplitsBasic = async (symbol: string, range: GetSplitsBasicRange = "1y"): Promise<GetSplitsBasic[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/splits/${range}`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetSplitsBasic[]
    }

    /**
     * KEy stats about a company
     * @param symbol
     */
    getStatsBasic = async (symbol: string): Promise<GetStatsBasic> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/stock/${symbol}/stats`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetStatsBasic
    }

    /**
     * This refdata endpoint returns the list of symbols that IEX Cloud supports for intraday price updates
     */
    getIntraDaySupportedSymbols = async (): Promise<GetIntradayPriceSupportedSymbols[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/ref-data/symbols`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetIntradayPriceSupportedSymbols[]
    }

    /**
     * This call returns an array of symbols the investors exchange supports for trading. This list is updated daily at
     * 7:45am ET. Symbols may be added or removed by the investors exchange after the list was produced.
     */
    getIexSymbols = async (): Promise<GetIexSymbols[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/ref-data/iex/symbols`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetIexSymbols[]
    }

    /**
     * This call returns an array of OTC symbols that IEX Cloud supports for API calls.
     */
    getOtcSymbols = async (): Promise<GetOtcSymbols[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/ref-data/otc/symbols`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetOtcSymbols[]
    }

    /**
     * Returns an array of exchanges
     */
    getUsExchanges = async (): Promise<GetUsExchanges[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/ref-data/market/us/exchanges`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetUsExchanges[]
    }

    /**
     * Returns an array of exchanges
     */
    getInternationalExchanges = async (): Promise<GetExchanges[]> => {
        const response = await this.retry(async () => {
            const response = await this.fetch(`/ref-data/exchanges`, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetExchanges[]
    }

    /**
     * Start date format is YYMMDD
     * TODO: Maybe swap out startdate for an actual timestamp type
     * @param type
     * @param direction
     * @param last
     * @param startDate
     */
    getUSHolidayAndTradingDays = async (type: "trade" | "holiday", direction: "next" | "last" = "next", last: number = 1, startDate?: string): Promise<GetUSHolidayAndTradingDays[]> => {
        const response = await this.retry(async () => {
            let u = `/ref-data/us/dates/${type}/${direction}/${last}`

            const response = await this.fetch(u, {
                method: "GET",
            }, {"token": this.token});
            if (response.status == 429) throw new RetryError()
            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json() as GetUSHolidayAndTradingDays[]
    }

    bulk = async (symbols: string[], types: BulkTypes[], queryParams?: object): Promise<Record<string, any>> => {
        const response = await this.retry(async () => {
            // TODO: Throw error if > 100 symbols
            // TODO: Throw error if > 10 types
            let symbolsJoined = symbols.join(",");
            let typesJoined = types.join(',')

            const response = await this.fetch(`/stock/market/batch`, {
                method: "GET",
            }, {
                ...queryParams,
                "token": this.token,
                symbols: symbolsJoined,
                types: typesJoined,
            });
            if (response.status == 429) throw new RetryError()
            if(response.status == 451) throw new PermissionRequiredError();

            const statusCodeShort = response.status / 100;
            if (statusCodeShort !== 2) throw new IEXError("getting data from iex", response.statusText, response.status)
            return response;
        }, this.retryMax);
        return await response.json()
    }
}