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
exports.DEVELOPMENT_BASE_URL = exports.PRODUCTION_BASE_URL = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.PRODUCTION_BASE_URL = "https://www.realizefi.com/api";
exports.DEVELOPMENT_BASE_URL = "";
class RealizeFiError extends Error {
    constructor(m) {
        super(m);
    }
}
/**
 * TODO:
 *  - Aborting
 *  - Retrying
 *  - Failure with 4xx response, returns another json body we can further investigate
 *      should make into realizefi error
 */
class Realizefi {
    constructor(apiKey, redirectUrl, baseUrl = exports.PRODUCTION_BASE_URL) {
        this.createUser = () => __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this.baseUrl}/users`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.listUsers = (cursor, take) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/users`;
            const queryParams = new URLSearchParams('');
            if (cursor)
                queryParams.append('cursor', cursor);
            if (take)
                queryParams.append('take', take);
            if (queryParams.toString().length > 0)
                requestUrl += queryParams.toString();
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.disconnectUsersInstitutionLink = (userId, institutionLinkId) => __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this.baseUrl}/users/${userId}/institution_links/${institutionLinkId}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                });
                return response.status === 204;
            }
            catch (e) {
                throw e;
            }
        });
        this.getUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/users/${userId}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.deleteUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/users/${userId}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                });
                return response.status === 204;
            }
            catch (e) {
                throw e;
            }
        });
        // TODO: Add in ability to limit what brokers users sign up
        //  with
        // TODO: Add in ability to limit scopes of trades(read only, vs. execute)
        this.createAuthPortal = (userId, successRedirect, failureRedirect, scopes, brokerages) => __awaiter(this, void 0, void 0, function* () {
            let body = Object.assign(Object.assign({ redirects: {
                    'success': successRedirect,
                    'failure': failureRedirect
                } }, (scopes && { scopes: [...scopes] })), (brokerages && { select: [...brokerages] }));
            let requestUrl = `${this.baseUrl}/users/${userId}/auth_portals`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        // TODO:
        this.placeOrder = () => __awaiter(this, void 0, void 0, function* () {
            throw new Error("implement me");
        });
        this.listOrders = (institutionLinkId, status = "ALL", cursor, take) => __awaiter(this, void 0, void 0, function* () {
            let qp = new URLSearchParams('');
            qp.append('status', status);
            if (cursor)
                qp.append('cursor', cursor);
            if (take)
                qp.append('take', take);
            const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/orders${qp.toString()}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.getOrder = (institutionLinkId, orderId) => __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/orders/${orderId}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.listUsersOrders = (userId, status = "ALL", cursor, take) => __awaiter(this, void 0, void 0, function* () {
            const qp = new URLSearchParams('');
            qp.append('status', status);
            if (cursor)
                qp.append('cursor', cursor);
            if (take)
                qp.append('take', take);
            const requestUrl = `${this.baseUrl}/users/${userId}/orders${qp.toString()}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.listPositions = (institutionLinkId) => __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/positions`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        // TODO
        this.createClientSession = () => __awaiter(this, void 0, void 0, function* () {
            throw new Error("implement me");
        });
        this.getApproximateHistoricalHoldings = (institutionLinkId, timeSpan) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/holdings`;
            if (timeSpan) {
                const qp = new URLSearchParams('');
                qp.append('span', timeSpan);
                requestUrl += qp.toString();
            }
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        /**
         * from: yyyy-MM-dd format
         * to: yyyy-MM-dd format
         * @param institutionLinkId
         * @param interval
         * @param from
         * @param to
         */
        this.getApproximateHistoricalPerformance = (institutionLinkId, interval, from, to) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/historical_performance`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.getInstitutionAsset = (institutionLinkId, symbol) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/assets/${symbol}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                // TODO: This is implemented on a per institution basis
                throw new Error("no implemented yet by realizefi ... ");
                // return await response.json() as GetInstitutionAssetResponse;
            }
            catch (e) {
                throw e;
            }
        });
        this.listInstitutionAssets = (institutionLinkId, symbols) => __awaiter(this, void 0, void 0, function* () {
            const qp = new URLSearchParams('');
            qp.append('symbols', symbols.join(','));
            let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/assets${qp.toString()}`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                throw new Error("not implemented yet -- institution basis");
                //return await response.json() as ListInstitutionAssetsResponse;
            }
            catch (e) {
                throw e;
            }
        });
        this.listWebhooks = () => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/app/webhooks`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.listTransactions = (institutionLinkId, cursor, take) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/transactions`;
            const qp = new URLSearchParams('');
            if (cursor)
                qp.append('cursor', cursor);
            if (take)
                qp.append('take', take);
            if (qp.toString().length > 0)
                requestUrl += qp.toString();
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                const { data } = yield response.json();
                let d = [];
                for (const c of data) {
                    d.push({
                        id: c.id,
                        transactionDate: c.transactionDate,
                        settlementDate: c.settlementDate,
                        type: c.type,
                        netAmount: c.netAmount,
                        details: {
                            transactionType: c.details && c.details.transactionType,
                            amount: c.details && c.details.amount,
                            direction: c.details && c.details.direction,
                            fees: c.details && c.details.fee
                        }
                    });
                }
                return { data: d };
            }
            catch (e) {
                throw e;
            }
        });
        this.getBalances = (institutionLinkId) => __awaiter(this, void 0, void 0, function* () {
            let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/balances`;
            try {
                const response = yield (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return yield response.json();
            }
            catch (e) {
                throw e;
            }
        });
        this.apiKey = apiKey;
        this.redirectUrl = redirectUrl;
        this.baseUrl = baseUrl;
    }
}
exports.default = Realizefi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBK0I7QUFhbEIsUUFBQSxtQkFBbUIsR0FBRywrQkFBK0IsQ0FBQztBQUN0RCxRQUFBLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUV2QyxNQUFNLGNBQWUsU0FBUSxLQUFLO0lBQzlCLFlBQVksQ0FBUztRQUNqQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0NBQ0o7QUFHRDs7Ozs7O0dBTUc7QUFFSCxNQUFxQixTQUFTO0lBSzFCLFlBQVksTUFBYyxFQUFFLFdBQW1CLEVBQUUsVUFBa0IsMkJBQW1CO1FBTXRGLGVBQVUsR0FBRyxHQUE4QixFQUFFO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sUUFBUSxDQUFDO1lBQzNDLElBQUk7Z0JBQ0EsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLG9CQUFLLEVBQUMsVUFBVSxFQUFFO29CQUNyQyxNQUFNLEVBQUUsTUFBTTtvQkFDZCxPQUFPLEVBQUU7d0JBQ0wsZUFBZSxFQUFFLFVBQVUsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDeEMsY0FBYyxFQUFFLGtCQUFrQjtxQkFDckM7aUJBQ0osQ0FBQyxDQUFBO2dCQUVGLE9BQU8sTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFnQixDQUFDO2FBQzlDO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxDQUFDLENBQUM7YUFDWDtRQUNMLENBQUMsQ0FBQSxDQUFBO1FBRUQsY0FBUyxHQUFHLENBQU8sTUFBYyxFQUFFLElBQVksRUFBc0IsRUFBRTtZQUNuRSxJQUFJLFVBQVUsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLFFBQVEsQ0FBQztZQUV6QyxNQUFNLFdBQVcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU07Z0JB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