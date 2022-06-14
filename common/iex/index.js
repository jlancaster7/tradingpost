"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IEX = exports.SandboxBaseURL = exports.ProductionBaseURL = exports.RetryError = exports.IEXError = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const sleep_1 = require("../utils/sleep");
const url_1 = require("url");
class IEXError extends Error {
    constructor(message, iexMessage, statusCode) {
        super(message);
        this.iexMessage = iexMessage;
        this.statusCode = statusCode;
    }
}
exports.IEXError = IEXError;
class RetryError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.RetryError = RetryError;
exports.ProductionBaseURL = "https://cloud.iexapis.com/v1";
exports.SandboxBaseURL = "https://sandbox.iexapis.com";
const HTTPConfigurationDefaults = {
    method: "GET"
};
class IEX {
    constructor(token, baseURL = exports.ProductionBaseURL, retryMax = 3) {
        this.fetch = (endpoint, httpConfiguration, queryParameters) => __awaiter(this, void 0, void 0, function* () {
            let url = new url_1.URL(this.baseURL);
            url.pathname += endpoint;
            if (queryParameters != null) {
                for (let k in queryParameters) {
                    const v = queryParameters[k];
                    url.searchParams.set(k, v);
                }
            }
            const config = Object.assign(Object.assign({}, HTTPConfigurationDefaults), httpConfiguration);
            return yield (0, node_fetch_1.default)(url.toString(), config);
        });
        this.retry = (fn, retryNum) => __awaiter(this, void 0, void 0, function* () {
            let err = null;
            for (let i = 0; i < retryNum; i++) {
                try {
                    return yield fn();
                }
                catch (e) {
                    if (e instanceof RetryError) {
                        const sleepMilli = 60 * i;
                        yield (0, sleep_1.sleep)(sleepMilli);
                        continue;
                    }
                    throw e;
                }
            }
            throw err;
        });
        this.getCompany = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/company`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        this.getStatus = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch("/status", {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Returns 15 minute delayed market quote
         */
        this.getDelayedQuote = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/delayed-quote`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         *  Provides basic dividend data for us equities, etfs, and mutual funds for the last 5 years.
         * @param symbol
         * @param range
         */
        this.getDividendsBasic = (symbol, range = "next") => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/dividends/${range}`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Returns adjusted and unadjusted historical data for up to 15 years, and historical minute-by-minute intraday
         * prices for the last 30 trailing calendar days.
         * @param symbol
         * @param queryParameters
         */
        this.getHistoricalPrices = (symbol, queryParameters = { range: '1y' }) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/chart`, {
                    method: "GET",
                }, Object.assign(Object.assign({}, queryParameters), { "token": this.token }));
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         *
         * @param symbol
         */
        this.getLogo = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/logo`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Returns the official open and close for a given symbol. The official open is available as soon as 9:45am ET and
         * the official close as soon as 4:15pm ET. Some stocks can report late open, or close prices.
         * @param symbol
         */
        this.getOHLC = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/ohlc`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Returns previous day adjusted price data for one or more stocks
         * @param symbol
         */
        this.getPreviousDayPrice = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/previous`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * All response attributes related to 15 minute delayed market-wide price data are only available to paid plans
         * @param symbol
         */
        this.getQuote = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/quote`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Returns aggregated intra-day prices in one-minute buckets for the current day
         * @param symbol
         * @param queryParameters
         */
        this.getIntraDayPrices = (symbol, queryParameters = {}) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/intraday-prices`, {
                    method: "GET",
                }, Object.assign(Object.assign({}, queryParameters), { "token": this.token }));
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Company stock splits...
         * @param symbol
         * @param range
         */
        this.getSplitsBasic = (symbol, range = "1y") => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/splits/${range}`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * KEy stats about a company
         * @param symbol
         */
        this.getStatsBasic = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/stock/${symbol}/stats`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * This refdata endpoint returns the list of symbols that IEX Cloud supports for intraday price updates
         */
        this.getIntraDaySupportedSymbols = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/ref-data/symbols`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * This call returns an array of symbols the investors exchange supports for trading. This list is updated daily at
         * 7:45am ET. Symbols may be added or removed by the investors exchange after the list was produced.
         */
        this.getIexSymbols = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/ref-data/iex/symbols`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * This call returns an array of OTC symbols that IEX Cloud supports for API calls.
         */
        this.getOtcSymbols = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/ref-data/otc/symbols`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Returns an array of exchanges
         */
        this.getUsExchanges = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/ref-data/market/us/exchanges`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Returns an array of exchanges
         */
        this.getInternationalExchanges = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetch(`/ref-data/exchanges`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        /**
         * Start date format is YYMMDD
         * TODO: Maybe swap out startdate for an actual timestamp type
         * @param type
         * @param direction
         * @param last
         * @param startDate
         */
        this.getUSHolidayAndTradingDays = (type, direction = "next", last = 1, startDate) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                let u = `/ref-data/us/dates/${type}/${direction}/${last}`;
                if (startDate !== null)
                    u += `/${startDate}`;
                const response = yield this.fetch(`/ref-data/exchanges`, {
                    method: "GET",
                }, { "token": this.token });
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        this.bulk = (symbols, types, queryParams) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.retry(() => __awaiter(this, void 0, void 0, function* () {
                // TODO: Throw error if > 100 symbols
                // TODO: Throw error if > 10 types
                let symbolsJoined = symbols.join(",");
                let typesJoined = types.join(',');
                const response = yield this.fetch(`/stock/market/batch`, {
                    method: "GET",
                }, Object.assign(Object.assign({}, queryParams), { "token": this.token, symbols: symbolsJoined, types: typesJoined }));
                if (response.status == 429)
                    throw new RetryError();
                const statusCodeShort = response.status / 100;
                if (statusCodeShort !== 2)
                    throw new IEXError("getting data from iex", response.statusText, response.status);
                return response;
            }), this.retryMax);
            return yield response.json();
        });
        this.token = token;
        this.baseURL = baseURL;
        this.retryMax = retryMax;
    }
}
exports.IEX = IEX;
