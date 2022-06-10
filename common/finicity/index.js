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
class FinicityApi {
    constructor() {
        /**
         * Validate partner id and secret + receive a secure access token
         * works for 2hrs, if exceeds 90 mins then re-authenticate
         * @param partnerId
         * @param partnerSecret
         * @param appKey
         */
        this.partnerAuthentication = (partnerId, partnerSecret, appKey) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v2/partners/authentication", {
                method: "POST",
                body: JSON.stringify({
                    "partnerId": partnerId,
                    "partnerSecret": partnerSecret,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': appKey
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
         * @param appToken
         * @param appKey
         */
        this.addTestCustomer = (username, appToken, appKey) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v2/customers/testing", {
                method: "POST",
                body: JSON.stringify({ username }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': appKey,
                    'Finicity-App-Token': appToken
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
        this.addCustomer = (applicationId, username, appToken, appKey) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v2/customers/active", {
                method: "POST",
                body: JSON.stringify({ username, applicationId }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': appKey,
                    'Finicity-App-Token': appToken
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
        this.getCustomers = (appToken, appKey) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/aggregation/v1/customers", {
                method: "POST",
                // body: JSON.stringify({username, applicationId}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': appKey,
                    'Finicity-App-Token': appToken
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
        this.generateConnectUrl = (appToken, appKey, partnerId, customerId, webhook, webhookContentType = "application/json", experience = "default") => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)("https://api.finicity.com/connect/v2/generate", {
                method: "POST",
                body: JSON.stringify({
                    partnerId: partnerId,
                    customerId: customerId,
                    webhook: webhook,
                    webhookContentType: webhookContentType,
                    experience: experience
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Finicity-App-Key': appKey,
                    'Finicity-App-Token': appToken
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
        this.generateConnectLiteUrl = () => __awaiter(this, void 0, void 0, function* () {
        });
        this.generateConnectEmail = () => __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = FinicityApi;
