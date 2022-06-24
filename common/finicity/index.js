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
                console.log(body);
                return null;
            }
        });
        /**
         * Adds user to testing FinBank
         * @param username
         */
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
                console.log(body);
                return null;
            }
        });
        this.addConsumer = (customerId, consumer, appKey, appToken) => __awaiter(this, void 0, void 0, function* () {
        });
        this.addCustomer = (applicationId, username) => __awaiter(this, void 0, void 0, function* () {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            };
            console.log(headers);
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v2/customers/active", {
                method: "POST",
                body: JSON.stringify({ username: username }),
                headers,
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw body.toString();
            }
        });
        this.getCustomers = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v1/customers", {
                method: "POST",
                // body: JSON.stringify({username, applicationId}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': this.appKey,
                    'Finicity-App-Token': this.accessToken
                }
            });
            console.log(response.status);
            console.log(response.statusText);
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                console.log(body);
                return null;
            }
        });
        this.getCustomer = () => __awaiter(this, void 0, void 0, function* () {
        });
        this.generateConnectUrl = (customerId, webhook, webhookContentType = "application/json", experience = "default") => __awaiter(this, void 0, void 0, function* () {
            console.log("Generating connect token...");
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            };
            console.log("CustomerID: ", customerId);
            console.log("Partner ID : ", this.partnerId);
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/connect/v2/generate", {
                method: "POST",
                body: JSON.stringify({
                    partnerId: this.partnerId,
                    customerId: customerId,
                    webhook: webhook,
                    webhookContentType: webhookContentType,
                    // experience: experience
                }),
                headers,
            });
            const body = yield response.text();
            try {
                return JSON.parse(body);
            }
            catch (e) {
                console.log(body.toString());
                throw e;
            }
        });
        this.generateConnectLiteUrl = () => __awaiter(this, void 0, void 0, function* () {
        });
        this.generateConnectEmail = (customerId) => __awaiter(this, void 0, void 0, function* () {
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
                throw e;
            }
        });
        this.partnerId = partnerId;
        this.partnerSecret = partnerSecret;
        this.appKey = appKey;
        this.tokenFile = tokenFile;
    }
}
exports.default = Finicity;
