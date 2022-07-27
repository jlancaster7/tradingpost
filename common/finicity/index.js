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
const node_fetch_1 = __importDefault(require("node-fetch"));
const luxon_1 = require("luxon");
const fs_1 = __importDefault(require("fs"));
class Finicity {
    constructor(partnerId, partnerSecret, appKey, tokenFile = 'finicity-api-token.json') {
        this.partnerId = "";
        this.partnerSecret = "";
        this.appKey = "";
        this.tokenFile = "";
        this.accessToken = "";
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const now = luxon_1.DateTime.now();
                const { token, expires } = JSON.parse(fs_1.default.readFileSync(this.tokenFile, 'utf8'));
                const dt = luxon_1.DateTime.fromSeconds(expires);
                if (now.toMillis() >= dt.toMillis())
                    yield this._updateAndWriteFile();
                else {
                    this.accessToken = token;
                    this.expiresAt = dt;
                }
            }
            catch (e) {
                yield this._updateAndWriteFile();
            }
            const hourAndAHalfInMilliseconds = 5400000;
            if (!this.expiresAt)
                throw Error("expires at not set");
            const runAgain = this.expiresAt.diffNow().as('milliseconds');
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield this._updateAndWriteFile();
                setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    yield this._updateAndWriteFile();
                }), hourAndAHalfInMilliseconds);
            }), runAgain);
        });
        this._updateAndWriteFile = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.partnerAuthentication();
            if (!response)
                throw Error("could not create access token");
            this.accessToken = response.token;
            this.expiresAt = luxon_1.DateTime.now().plus({ hour: 1, minute: 30 });
            fs_1.default.writeFileSync(this.tokenFile, JSON.stringify({
                token: response === null || response === void 0 ? void 0 : response.token,
                expires: this.expiresAt.toUnixInteger()
            }), {
                encoding: 'utf8'
            });
        });
        /**
         * Validate partner id and secret + receive a secure access token
         * works for 2hrs, if exceeds 90 mins then re-authenticate
         */
        this.partnerAuthentication = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v2/partners/authentication", {
                method: "POST",
                body: JSON.stringify({
                    "partnerId": this.partnerId,
                    "partnerSecret": this.partnerSecret,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.getInstitutions = (start, limit) => __awaiter(this, void 0, void 0, function* () {
            const url = new URL("https://api.finicity.com/institution/v2/institutions");
            url.searchParams.set("start", start.toString());
            url.searchParams.set("limit", limit.toString());
            const response = yield (0, node_fetch_1.default)(url.toString(), {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.addTestCustomer = (username) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v2/customers/testing", {
                method: "POST",
                body: JSON.stringify({ username }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.getConsumer = (customerId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/decisioning/v1/customers/${customerId}/consumer`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.addConsumer = (customerId, consumer) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/decisioning/v1/customers/${customerId}/consumer`, {
                method: "POST",
                body: JSON.stringify(consumer),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.addCustomer = (applicationId, username) => __awaiter(this, void 0, void 0, function* () {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            };
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v2/customers/active", {
                method: "POST",
                body: JSON.stringify({ username: username }),
                headers,
            });
            const body = yield response.text();
            try {
                return yield JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.getCustomers = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v1/customers", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.getCustomerAccounts = (customerId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.getCustomerAccountById = (customerId, accountId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts/${accountId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.generateConnectUrl = (customerId, webhook, webhookContentType = "application/json", experience = "default") => __awaiter(this, void 0, void 0, function* () {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            };
            const finicityCallbackUrl = process.env.FINICITY_CALLBACK_URL;
            if (!finicityCallbackUrl)
                throw new Error("finicity callback url not set within the system");
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/connect/v2/generate", {
                method: "POST",
                body: JSON.stringify({
                    partnerId: this.partnerId,
                    customerId: customerId,
                    // webhook: webhook,
                    // webhookContentType: webhookContentType,
                    redirectUri: finicityCallbackUrl,
                }),
                headers,
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.refreshCustomerAccounts = (customerId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.loadHistoricTransactionsForCustomerAccount = (customerId, accountId) => __awaiter(this, void 0, void 0, function* () {
            yield (0, node_fetch_1.default)(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts/${accountId}/transactions/historic`, {
                method: "POST",
                body: JSON.stringify({}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
        });
        this.getAccountOwner = (customerId, accountId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts/${accountId}/owner`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.getAllCustomerTransactions = (customerId, params) => __awaiter(this, void 0, void 0, function* () {
            const url = new URL(`https://api.finicity.com/aggregation/v3/customers/${customerId}/transactions`);
            Object.keys(params).forEach((key) => {
                const val = params[key];
                if (!val)
                    return;
                if (typeof val !== 'string' || typeof val.toString() === 'undefined')
                    return;
                url.searchParams.set(key, val.toString());
            });
            const response = yield (0, node_fetch_1.default)(url.toString(), {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.partnerId = partnerId;
        this.partnerSecret = partnerSecret;
        this.appKey = appKey;
        this.tokenFile = tokenFile;
    }
}
exports.default = Finicity;
