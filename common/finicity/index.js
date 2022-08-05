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
        this.partnerId = partnerId;
        this.partnerSecret = partnerSecret;
        this.appKey = appKey;
        this.tokenFile = tokenFile;
    }
}
exports.default = Finicity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLDREQUErQjtBQUMvQixpQ0FBK0I7QUFpQi9CLDRDQUFvQjtBQUVwQixNQUFxQixRQUFRO0lBUXpCLFlBQVksU0FBaUIsRUFBRSxhQUFxQixFQUFFLE1BQWMsRUFBRSxZQUFvQix5QkFBeUI7UUFQbkgsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixrQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFVekIsU0FBSSxHQUFHLEdBQXdCLEVBQUU7WUFDN0IsSUFBSTtnQkFDQSxNQUFNLEdBQUcsR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUMzQixNQUFNLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdFLE1BQU0sRUFBRSxHQUFHLGdCQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUFFLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7cUJBQ2hFO29CQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO29CQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztpQkFDdkI7YUFDSjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7YUFDbkM7WUFFRCxNQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQztZ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