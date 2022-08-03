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
exports.SandboxBaseURL = exports.ProductionBaseURL = exports.RetryError = exports.IEXError = void 0;
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
                const response = yield this.fetch(u, {
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
exports.default = IEX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBMkM7QUFDM0MsMENBQXFDO0FBQ3JDLDZCQUF3QjtBQUV4QixNQUFhLFFBQVMsU0FBUSxLQUFLO0lBSS9CLFlBQVksT0FBZSxFQUFFLFVBQWtCLEVBQUUsVUFBa0I7UUFDL0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7SUFDaEMsQ0FBQztDQUNKO0FBVEQsNEJBU0M7QUFFRCxNQUFhLFVBQVcsU0FBUSxLQUFLO0lBQ2pDLFlBQVksT0FBZ0I7UUFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQUpELGdDQUlDO0FBRVksUUFBQSxpQkFBaUIsR0FBRyw4QkFBOEIsQ0FBQztBQUNuRCxRQUFBLGNBQWMsR0FBRyw2QkFBNkIsQ0FBQztBQVE1RCxNQUFNLHlCQUF5QixHQUFHO0lBQzlCLE1BQU0sRUFBRSxLQUFLO0NBQ2hCLENBQUE7QUF5WEQsTUFBcUIsR0FBRztJQUtwQixZQUFZLEtBQWEsRUFBRSxVQUFrQix5QkFBaUIsRUFBRSxXQUFtQixDQUFDO1FBTXBGLFVBQUssR0FBRyxDQUFPLFFBQWdCLEVBQUUsaUJBQW9DLEVBQUUsZUFBcUMsRUFBZ0IsRUFBRTtZQUMxSCxJQUFJLEdBQUcsR0FBRyxJQUFJLFNBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDL0IsR0FBRyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUM7WUFDekIsSUFBSSxlQUFlLElBQUksSUFBSSxFQUFFO2dCQUN6QixLQUFLLElBQUksQ0FBQyxJQUFJLGVBQWUsRUFBRTtvQkFDM0IsTUFBTSxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFD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