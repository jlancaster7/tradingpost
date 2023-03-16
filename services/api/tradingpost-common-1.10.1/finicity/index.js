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
class Service {
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
        this.getInstitution = (institutionId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/institution/v2/institutions/${institutionId}`, {
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
                const res = yield JSON.parse(body);
                if ('code' in res)
                    return res;
                return res;
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.getCustomers = (start = 0, limit = 25, username) => __awaiter(this, void 0, void 0, function* () {
            const url = new URL("https://api.finicity.com/aggregation/v1/customers");
            url.searchParams.set("start", start.toString());
            url.searchParams.set("limit", limit.toString());
            if (username)
                url.searchParams.set("username", username);
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
        this.getCustomerAccounts = (customerId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/aggregation/v2/customers/${customerId}/accounts`, {
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
        this.generateConnectFix = (request) => __awaiter(this, void 0, void 0, function* () {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            };
            const finicityCallbackUrl = process.env.FINICITY_CALLBACK_URL;
            if (!finicityCallbackUrl)
                throw new Error("finicity callback url not set within the system");
            if (!request.redirectUri)
                request.redirectUri = finicityCallbackUrl;
            if (!request.partnerId)
                request.partnerId = this.partnerId;
            const url = `https://api.finicity.com/connect/v2/generate/fix`;
            const response = yield (0, node_fetch_1.default)(url, {
                method: "POST",
                body: JSON.stringify(request),
                headers
            });
            const body = yield response.text();
            try {
                const r = JSON.parse(body);
                console.log(r);
                return r;
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
                    webhook: webhook,
                    webhookContentType: webhookContentType,
                    redirectUri: finicityCallbackUrl,
                    experience: "c201a18b-728f-460c-b964-d566273a6e33"
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
        this.getAccountAndHoldings = (customerId, accountId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`https://api.finicity.com/aggregation/v2/customers/${customerId}/accounts/${accountId}`, {
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
            const url = new URL(`https://api.finicity.com/aggregation/v4/customers/${customerId}/transactions`);
            Object.keys(params).forEach((key) => {
                const val = params[key];
                if (!val)
                    return;
                if (typeof val !== 'string' && typeof val.toString() === 'undefined')
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
        this.registerTxPush = (customerId, accountId, callbackUrl) => __awaiter(this, void 0, void 0, function* () {
            const url = new URL(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts/${accountId}/txpush`);
            const response = yield (0, node_fetch_1.default)(url.toString(), {
                method: "POST",
                headers: {
                    'Finicity-App-Token': this.accessToken,
                    'Finicity-App-Key': this.appKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    callbackUrl: callbackUrl
                })
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error(body.toString());
            }
        });
        this.deleteTxPushSubscription = (customerId, subscriptionId) => __awaiter(this, void 0, void 0, function* () {
            const url = new URL(`https://api.finicity.com/aggregation/v1/customers/${customerId}/subscriptions/${subscriptionId}`);
            yield (0, node_fetch_1.default)(url.toString(), {
                method: "DELETE",
                headers: {
                    'Finicity-App-Token': this.accessToken,
                    'Finicity-App-Key': this.appKey
                }
            });
            // TODO: Make check status code to make sure things were deleted appropriately....
        });
        this.partnerId = partnerId;
        this.partnerSecret = partnerSecret;
        this.appKey = appKey;
        this.tokenFile = tokenFile;
    }
}
exports.default = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLDREQUErQjtBQUMvQixpQ0FBK0I7QUFrQi9CLDRDQUFvQjtBQUVwQixNQUFxQixPQUFPO0lBUXhCLFlBQVksU0FBaUIsRUFBRSxhQUFxQixFQUFFLE1BQWMsRUFBRSxZQUFvQix5QkFBeUI7UUFQbkgsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixrQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFVekIsU0FBSSxHQUFHLEdBQXdCLEVBQUU7WUFDN0IsSUFBSTtnQkFDQSxNQUFNLEdBQUcsR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUMzQixNQUFNLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdFLE1BQU0sRUFBRSxHQUFHLGdCQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUFFLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7cUJBQ2hFO29CQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO29CQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztpQkFDdkI7YUFDSjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7YUFDbkM7WUFFRCxNQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQztZ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