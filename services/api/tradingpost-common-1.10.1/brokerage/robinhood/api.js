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
exports.user = exports.challengeRequest = exports.login = exports.dayTrades = exports.option = exports.instruments = exports.instrument = exports.portfolios = exports.phoenixAccount = exports.positions = exports.dividends = exports.optionEvents = exports.optionOrders = exports.optionPositions = exports.orders = exports.accounts = exports.achTransfers = exports.sweeps = exports.refreshToken = exports.AuthError = void 0;
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
const apiHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-robinhood-api-version': '1.431.4'
};
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
        headers: apiHeaders,
        body: JSON.stringify(payload)
    });
});
exports.refreshToken = refreshToken;
const sweeps = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/accounts/sweeps/"), {});
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` })
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
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` })
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
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` })
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
        headers: Object.assign(Object.assign({}, apiHeaders), { 'Authorization': `Bearer ${_accessToken}` })
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
        headers: Object.assign(Object.assign({}, apiHeaders), { 'Authorization': `Bearer ${_accessToken}` })
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.optionOrders = optionOrders;
const optionEvents = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/options/events"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: Object.assign(Object.assign({}, apiHeaders), { 'Authorization': `Bearer ${_accessToken}` })
    });
    const nextUrl = response.next ? response.next : null;
    const results = response.results;
    return [results, nextUrl];
});
exports.optionEvents = optionEvents;
const dividends = (_accessToken, params, pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL("https://api.robinhood.com/dividends/"), params);
    const response = yield _do(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` })
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
        headers: Object.assign(Object.assign({}, apiHeaders), { "Authorization": `Bearer ${_accessToken}` }),
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
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` }),
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
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` }),
    });
});
exports.instrument = instrument;
const instruments = (_accessToken, params) => __awaiter(void 0, void 0, void 0, function* () {
    const url = _buildUrl(new URL(`https://api.robinhood.com/instruments/`), params);
    const response = yield _do(url.toString(), {
        method: "GET",
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` }),
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
        headers: Object.assign(Object.assign({}, apiHeaders), { Authorization: `Bearer ${_accessToken}` }),
    });
});
exports.option = option;
const dayTrades = (_accessToken, accountNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(`https://api.robinhood.com/accounts/${accountNumber}/recent_day_trades/`);
    return yield _do(url.toString(), {
        method: "GET",
        headers: Object.assign(Object.assign({}, apiHeaders), { "Authorization": `Bearer ${_accessToken}` })
    });
});
exports.dayTrades = dayTrades;
const login = (body, headers) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL("https://api.robinhood.com/oauth2/token/");
    return yield _do(url.toString(), {
        method: "POST",
        headers: Object.assign(Object.assign({}, apiHeaders), headers),
        body: JSON.stringify(body)
    });
});
exports.login = login;
const challengeRequest = (challengeId, passCode, headers) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(`https://api.robinhood.com/challenge/${challengeId}/respond/`);
    return yield _do(url.toString(), {
        method: "POST",
        headers: Object.assign(Object.assign({}, apiHeaders), headers),
        body: JSON.stringify({
            response: passCode
        })
    });
});
exports.challengeRequest = challengeRequest;
const user = (_accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(`https://api.robinhood.com/user/`);
    return yield _do(url.toString(), {
        method: "GET",
        headers: Object.assign(Object.assign({}, apiHeaders), { "Authorization": `Bearer ${_accessToken}` })
    });
});
exports.user = user;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDREQUE4QjtBQVk5Qjs7OztHQUlHO0FBRUgsTUFBYSxTQUFVLFNBQVEsS0FBSztJQUNoQyxZQUFZLEdBQVc7UUFDbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBSkQsOEJBSUM7QUFFRCxNQUFNLFVBQVUsR0FBMkI7SUFDdkMsY0FBYyxFQUFFLGtCQUFrQjtJQUNsQyxRQUFRLEVBQUUsa0JBQWtCO0lBQzVCLHlCQUF5QixFQUFFLFNBQVM7Q0FDdkMsQ0FBQTtBQUVELE1BQU0sR0FBRyxHQUFHLENBQVUsR0FBVyxFQUFFLE9BQW9CLEVBQWMsRUFBRTtJQUNuRSxhQUFhO0lBQ2IsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFBLG9CQUFLLEVBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3JDLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxHQUFHO1FBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoRCxPQUFPLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBTyxDQUFBO0FBQ2hDLENBQUMsQ0FBQSxDQUFBO0FBRUQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFRLEVBQUUsTUFBMkIsRUFBTyxFQUFFO0lBQzdELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2hDLElBQUksQ0FBQyxHQUEyQixFQUFFLENBQUE7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRTtZQUMxQyxhQUFhO1lBQ2IsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFB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