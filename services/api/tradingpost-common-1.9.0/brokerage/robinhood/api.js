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
exports.dayTrades = exports.option = exports.instruments = exports.instrument = exports.portfolios = exports.phoenixAccount = exports.positions = exports.dividends = exports.optionOrders = exports.optionPositions = exports.orders = exports.accounts = exports.achTransfers = exports.sweeps = exports.refreshToken = exports.AuthError = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * TODO:
 *      - minerva.robinhood.com/history/transactions/ -- Dont know what this is... want to find out more (looks like a bill payment)
 *      - api.robinhood.com/crypto/orders/ -- get orders
 */
class AuthError extends Error {
    constructor(msg) {
        super(msg);
    }
}
exports.AuthError = AuthError;
const _do = (url, request) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const res = yield (0, node_fetch_1.default)(url, request);
    if (res.status === 401)
        throw new AuthError('');
    return yield res.json();
});
const _buildUrl = (url, params) => {
    if (Object.keys(params).length > 0) {
        let p = {};
        Object.keys(params).forEach((param) => {
            // @ts-ignore
            const v = params[param];
            if (v === undefined || v === null)
                return;
            p[param] = v.toString();
        });
        url.search = new URLSearchParams(p).toString();
    }
    return url;
};
const refreshToken = (clientId, deviceToken, _refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        grant_type: 'refresh_token',
        refresh_token: _refreshToken,
        scope: 'internal',
        client_id: clientId,
        device_token: deviceToken,
    };
    return yield _do("https://api.robinhood.com/oauth2/token/", {
        method: "POST",
        body: JSON.stringify(payload)
    });
});
exports.refreshToken = refreshToken;
const sweeps = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/accounts/sweeps/"), {});
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.sweeps = sweeps;
const achTransfers = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://cashier.robinhood.com/ach/transfers/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.achTransfers = achTransfers;
const accounts = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/accounts/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });
    const nextUrl = response.next ? response.next : null;
    if (!('results' in response))
        return [[], nextUrl];
    return [response['results'], nextUrl];
});
exports.accounts = accounts;
const orders = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/orders/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.orders = orders;
const optionPositions = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/options/positions/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${_accessToken}`
        }
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.optionPositions = optionPositions;
const optionOrders = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/options/orders/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${_accessToken}`
        }
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.optionOrders = optionOrders;
const dividends = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/dividends/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.dividends = dividends;
const positions = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/positions/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${_accessToken}`
        },
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.positions = positions;
const phoenixAccount = (_accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL("https://phoenix.robinhood.com/accounts/unified");
    return _do(url.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${_accessToken}`
        }
    });
});
exports.phoenixAccount = phoenixAccount;
const portfolios = (_accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL("https://api.robinhood.com/portfolios/");
    const res = yield _do(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    });
    if (!('results' in res))
        return [];
    return res['results'];
});
exports.portfolios = portfolios;
const instrument = (_accessToken, params) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(`https://api.robinhood.com/instruments/${params.instrumentId}/`);
    return yield _do(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    });
});
exports.instrument = instrument;
const instruments = (_accessToken, params) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL(`https://api.robinhood.com/instruments/`), params);
    const response = yield _do(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    });
    if (!('results' in response))
        return null;
    if (response.results.length <= 0)
        return null;
    return response.results[0];
});
exports.instruments = instruments;
const option = (_accessToken, params) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(`https://api.robinhood.com/options/instruments/${params.optionId}/`);
    return yield _do(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    });
});
exports.option = option;
const dayTrades = (_accessToken, accountNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(`https://api.robinhood.com/accounts/${accountNumber}/recent_day_trades/`);
    return yield _do(url.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${_accessToken}`
        }
    });
});
exports.dayTrades = dayTrades;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDREQUE4QjtBQVk5Qjs7OztHQUlHO0FBRUgsTUFBYSxTQUFVLFNBQVEsS0FBSztJQUNoQyxZQUFZLEdBQVc7UUFDbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBSkQsOEJBSUM7QUFFRCxNQUFNLEdBQUcsR0FBRyxDQUFVLEdBQVcsRUFBRSxPQUFvQixFQUFjLEVBQUU7SUFDbkUsYUFBYTtJQUNiLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSxvQkFBSyxFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUNyQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRztRQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEQsT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQU8sQ0FBQTtBQUNoQyxDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBUSxFQUFFLE1BQTJCLEVBQU8sRUFBRTtJQUM3RCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNoQyxJQUFJLENBQUMsR0FBMkIsRUFBRSxDQUFBO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBYSxFQUFFLEVBQUU7WUFDMUMsYUFBYTtZQUNiLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxLQUFLLElBQUk7Z0JBQUUsT0FBTztZQUMxQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxD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