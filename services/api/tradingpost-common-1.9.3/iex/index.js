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
exports.SandboxBaseURL = exports.ProductionBaseURL = exports.PermissionRequiredError = exports.RetryError = exports.IEXError = void 0;
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
class PermissionRequiredError extends Error {
    constructor(msg) {
        super(msg);
    }
}
exports.PermissionRequiredError = PermissionRequiredError;
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
                if (response.status == 451)
                    throw new PermissionRequiredError();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBMkM7QUFDM0MsMENBQXFDO0FBQ3JDLDZCQUF3QjtBQUV4QixNQUFhLFFBQVMsU0FBUSxLQUFLO0lBSS9CLFlBQVksT0FBZSxFQUFFLFVBQWtCLEVBQUUsVUFBa0I7UUFDL0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7SUFDaEMsQ0FBQztDQUNKO0FBVEQsNEJBU0M7QUFFRCxNQUFhLFVBQVcsU0FBUSxLQUFLO0lBQ2pDLFlBQVksT0FBZ0I7UUFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQUpELGdDQUlDO0FBRUQsTUFBYSx1QkFBd0IsU0FBUSxLQUFLO0lBQzlDLFlBQVksR0FBWTtRQUNwQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0NBQ0o7QUFKRCwwREFJQztBQUVZLFFBQUEsaUJBQWlCLEdBQUcsOEJBQThCLENBQUM7QUFDbkQsUUFBQSxjQUFjLEdBQUcsNkJBQTZCLENBQUM7QUFRNUQsTUFBTSx5QkFBeUIsR0FBRztJQUM5QixNQUFNLEVBQUUsS0FBSztDQUNoQixDQUFBO0FBeVhELE1BQXFCLEdBQUc7SUFLcEIsWUFBWSxLQUFhLEVBQUUsVUFBa0IseUJBQWlCLEVBQUUsV0FBbUIsQ0FBQztRQU1wRixVQUFLLEdBQUcsQ0FBTyxRQUFnQixFQUFFLGlCQUFvQyxFQUFFLGVBQXFDLEVBQWdCLEVBQUU7WUFDMUgsSUFBSSxHQUFHLEdBQUcsSUFBSSxTQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQy9CLEdBQUcsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDO1lBQ3pCLElBQUksZUFB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