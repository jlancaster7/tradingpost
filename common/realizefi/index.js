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
