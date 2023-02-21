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
const _1 = require(".");
const Brokerage_1 = require("./Brokerage");
const uuid_1 = require("uuid");
const node_fetch_1 = __importDefault(require("node-fetch"));
const interfaces_1 = require("../../../brokerage/interfaces");
const db_1 = require("../../../db");
const repository_1 = __importDefault(require("../../../brokerage/repository"));
const configuration_1 = require("../../../configuration");
const luxon_1 = require("luxon");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const portfolio_summary_1 = require("../../../brokerage/portfolio-summary");
const loginUrl = 'https://api.robinhood.com/oauth2/token/';
const pingUrl = (id) => `https://api.robinhood.com/push/${id}/get_prompts_status`;
const pingMap = {
    "redeemed": Brokerage_1.RobinhoodChallengeStatus.Redeemed,
    "issued": Brokerage_1.RobinhoodChallengeStatus.Issued,
    "validated": Brokerage_1.RobinhoodChallengeStatus.Validated
};
const generatePayloadRequest = (clientId, expiresIn, scope, username, password, fauxDeviceToken, headers, mfaCode, challengeResponseId) => {
    let challengeType = "sms";
    let payload = {
        "username": username,
        "password": password,
        "client_id": clientId,
        "expires_in": expiresIn,
        "grant_type": 'password',
        "scope": scope,
        "challenge_type": challengeType,
        "device_token": fauxDeviceToken
    };
    // MFA Login
    if (mfaCode) {
        payload["mfa_code"] = mfaCode;
        return [headers, payload];
    }
    if (challengeResponseId) {
        payload["try_passkeys"] = false;
        headers['x-robinhood-challenge-response-id'] = challengeResponseId;
        return [headers, payload];
    }
    return [headers, payload];
};
// We want to build different requests based on different requesting states
exports.default = (0, _1.ensureServerExtensions)({
    robinhoodLogin: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const robinhoodCredentials = yield configuration_1.DefaultConfig.fromCacheOrSSM("robinhood");
        const { username, password, mfaCode, challengeResponseId } = req.body;
        const { pgp, pgClient, sqsClient } = yield db_1.init;
        const brokerageRepo = new repository_1.default(pgClient, pgp);
        let tpBrokerageAccount = null;
        const tpBrokerageAccounts = yield brokerageRepo.getTradingPostBrokerageAccountsByBrokerageAndIds(req.extra.userId, "Robinhood", [username]);
        if (tpBrokerageAccounts.length > 1)
            throw new Error("cant have more than one brokerage account for robinhood user");
        if (tpBrokerageAccounts.length > 0)
            tpBrokerageAccount = tpBrokerageAccounts[0];
        if (tpBrokerageAccount && tpBrokerageAccount.status === 'active')
            return {
                status: Brokerage_1.RobinhoodLoginStatus.SUCCESS,
                body: "Robinhood account already exists and is active"
            };
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-robinhood-api-version': '1.431.4'
        };
        const robinhoodUser = yield brokerageRepo.getRobinhoodUser(req.extra.userId);
        let fauxDeviceToken = (0, uuid_1.v4)();
        if (robinhoodUser)
            fauxDeviceToken = robinhoodUser.deviceToken;
        const [requestHeaders, requestPayload] = generatePayloadRequest(robinhoodCredentials.clientId, robinhoodCredentials.expiresIn, robinhoodCredentials.scope, username, password, fauxDeviceToken, headers, mfaCode, challengeResponseId);
        try {
            const response = yield (0, node_fetch_1.default)(loginUrl, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestPayload)
            });
            const body = yield response.json();
            // Credentials Provided Incorrectly
            if (body['detail'] === 'Unable to log in with provided credentials.')
                return {
                    status: Brokerage_1.RobinhoodLoginStatus.ERROR,
                    body: "Credentials provided incorrectly"
                };
            if (!robinhoodUser)
                yield brokerageRepo.insertRobinhoodUser({
                    username: username,
                    deviceToken: fauxDeviceToken,
                    usesMfa: mfaCode !== null && !body['mfa_required'] && !body['challenge'],
                    status: Brokerage_1.RobinhoodLoginStatus.SUCCESS,
                    accessToken: body.access_token ? body.access_token : null,
                    refreshToken: body.refresh_token ? body.refresh_token : null,
                    userId: req.extra.userId
                });
            // Basic MFA
            // Have them type in a passcode
            if ('mfa_required' in body)
                return {
                    status: Brokerage_1.RobinhoodLoginStatus.MFA,
                    body: "MFA required to proceed"
                };
            if ('challenge' in body) {
                // this is the challenge where you constantly ping
                if (body['challenge']['status'] === 'issued')
                    return {
                        status: Brokerage_1.RobinhoodLoginStatus.DEVICE_APPROVAL,
                        body: "Please, approve the login on your device.",
                        challengeResponseId: body['challenge']['id'],
                    };
            }
            // Made it through authentication and we have an access token
            yield brokerageRepo.updateRobinhoodUser({
                username: username,
                refreshToken: body.refresh_token,
                userId: req.extra.userId,
                accessToken: body.access_token,
                status: Brokerage_1.RobinhoodLoginStatus.SUCCESS,
                usesMfa: mfaCode !== null,
                deviceToken: fauxDeviceToken,
            });
            yield sqsClient.send(new client_sqs_1.SendMessageCommand({
                MessageBody: JSON.stringify({
                    type: interfaces_1.BrokerageTaskType.NewAccount,
                    userId: req.extra.userId,
                    status: interfaces_1.BrokerageTaskStatusType.Pending,
                    data: null,
                    started: null,
                    finished: null,
                    brokerage: interfaces_1.DirectBrokeragesType.Robinhood,
                    date: luxon_1.DateTime.now().setZone("America/New_York"),
                    brokerageUserId: username,
                    error: null,
                    messageId: null
                }),
                DelaySeconds: 0,
                QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
            }));
            return {
                status: Brokerage_1.RobinhoodLoginStatus.SUCCESS,
                body: "Robinhood account successfully updated in TradingPost"
            };
        }
        catch (e) {
            console.error(e);
            return {
                status: Brokerage_1.RobinhoodLoginStatus.ERROR,
                body: e instanceof Error ? e.toString() : "Something went wrong trying to add your Robinhood account to TradingPost."
            };
        }
    }),
    hoodPing: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const { requestId } = req.body;
        try {
            const response = yield (0, node_fetch_1.default)(pingUrl(requestId), {
                method: "GET"
            });
            const body = yield response.json();
            if ('detail' in body) {
                console.error("pinging the hood for challenge status: ", body.detail);
                return { challengeStatus: Brokerage_1.RobinhoodChallengeStatus.Unknown };
            }
            if (body.challenge_status in pingMap) {
                const challengeStatus = body.challenge_status;
                return {
                    challengeStatus: pingMap[challengeStatus]
                };
            }
            return {
                challengeStatus: Brokerage_1.RobinhoodChallengeStatus.Unknown
            };
        }
        catch (e) {
            console.error(e);
            return { challengeStatus: Brokerage_1.RobinhoodChallengeStatus.Unknown };
        }
    }),
    scheduleForDeletion: (req) => __awaiter(void 0, void 0, void 0, function* () {
        // Change TP account ID to hidden and publish event to remove account
        const { pgp, pgClient, sqsClient } = yield db_1.init;
        const brokerageRepo = new repository_1.default(pgClient, pgp);
        const tpAccounts = yield brokerageRepo.getTradingPostBrokerageAccounts(req.extra.userId);
        if (tpAccounts.length <= 0)
            return {};
        const tpAccount = tpAccounts.find(tp => tp.id === req.body.accountId);
        if (!tpAccount)
            return {};
        yield brokerageRepo.deleteTradingPostBrokerageAccounts([req.body.accountId]);
        yield sqsClient.send(new client_sqs_1.SendMessageCommand({
            MessageBody: JSON.stringify({
                status: interfaces_1.BrokerageTaskStatusType.Pending,
                date: luxon_1.DateTime.now(),
                userId: req.extra.userId,
                type: interfaces_1.BrokerageTaskType.DeleteAccount,
                started: null,
                finished: null,
                data: { brokerage: req.body.brokerage, accountId: req.body.accountId },
                error: null,
                brokerageUserId: tpAccount.accountNumber,
                brokerage: req.body.brokerage,
                messageId: null
            }),
            DelaySeconds: 0,
            QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
        }));
        if (tpAccounts.length <= 1)
            return {};
        const portSummary = new portfolio_summary_1.PortfolioSummaryService(brokerageRepo);
        yield portSummary.computeAccountGroupSummary(req.extra.userId);
        return {};
    }),
    createIbkrAccounts: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const { pgp, pgClient, sqsClient } = yield db_1.init;
        const repository = new repository_1.default(pgClient, pgp);
        const ibkrAccounts = req.body.account_ids.map(ai => {
            let x = {
                accountId: ai,
                masterAccountId: ai,
                userId: req.extra.userId,
                van: null,
                accountTitle: null,
                accountType: null,
                zip: null,
                type: null,
                alias: null,
                country: null,
                city: null,
                accountRepresentative: null,
                baseCurrency: null,
                capabilities: null,
                customerType: null,
                dateClosed: null,
                dateFunded: null,
                dateOpened: luxon_1.DateTime.now(),
                state: null,
                street: null,
                street2: null,
                primaryEmail: null,
                accountProcessDate: luxon_1.DateTime.now()
            };
            return x;
        });
        yield repository.upsertIbkrAccounts(ibkrAccounts);
        const ibkrInstitution = yield repository.getInstitutionByName("Interactive Brokers - Account Management");
        if (!ibkrInstitution)
            throw new Error("no institution found by name");
        const tpAccounts = req.body.account_ids.map(ai => {
            let x = {
                userId: req.extra.userId,
                accountStatus: interfaces_1.TradingPostBrokerageAccountStatus.PROCESSING,
                error: false,
                type: '',
                status: '',
                hiddenForDeletion: false,
                errorCode: 0,
                mask: null,
                institutionId: ibkrInstitution === null || ibkrInstitution === void 0 ? void 0 : ibkrInstitution.id,
                brokerName: interfaces_1.DirectBrokeragesType.Ibkr,
                accountNumber: ai,
                name: '',
                subtype: null,
                officialName: null,
                authenticationService: "Ibkr"
            };
            return x;
        });
        const newTpAccountIds = yield repository.upsertTradingPostBrokerageAccounts(tpAccounts);
        yield repository.addTradingPostAccountGroup(req.extra.userId, 'default', newTpAccountIds, 10117);
        for (let i = 0; i < req.body.account_ids.length; i++) {
            const ai = req.body.account_ids[i];
            yield sqsClient.send(new client_sqs_1.SendMessageCommand({
                MessageBody: JSON.stringify({
                    type: interfaces_1.BrokerageTaskType.NewAccount,
                    userId: req.extra.userId,
                    status: interfaces_1.BrokerageTaskStatusType.Pending,
                    data: null,
                    started: null,
                    finished: null,
                    brokerage: interfaces_1.DirectBrokeragesType.Ibkr,
                    date: luxon_1.DateTime.now().setZone("America/New_York"),
                    brokerageUserId: ai,
                    error: null,
                    messageId: null
                }),
                DelaySeconds: 0,
                QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
            }));
        }
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJva2VyYWdlLnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJyb2tlcmFnZS5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFFekMsMkNBQThHO0FBQzlHLCtCQUFrQztBQUNsQyw0REFBK0I7QUFDL0IsOERBT3VDO0FBQ3ZDLG9DQUFpQztBQUNqQywrRUFBdUQ7QUFDdkQsMERBQXFEO0FBQ3JELGlDQUErQjtBQUMvQixvREFBdUQ7QUFDdkQsNEVBQTZFO0FBRTdFLE1BQU0sUUFBUSxHQUFHLHlDQUF5QyxDQUFDO0FBQzNELE1BQU0sT0FBTyxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRSxxQkFBcUIsQ0FBQztBQUMxRixNQUFNLE9BQU8sR0FBMkI7SUFDcEMsVUFBVSxFQUFFLG9DQUF3QixDQUFDLFFBQVE7SUFDN0MsUUFBUSxFQUFFLG9DQUF3QixDQUFDLE1BQU07SUFDekMsV0FBVyxFQUFFLG9DQUF3QixDQUFDLFNBQVM7Q0FDbEQsQ0FBQTtBQUVELE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxRQUFnQixFQUFFLFNBQWlCLEVBQUUsS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxlQUF1QixFQUFFLE9BQStCLEVBQUUsT0FBc0IsRUFBRSxtQkFBa0MsRUFBOEMsRUFBRTtJQUN4UixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDMUIsSUFBSSxPQUFPLEdBQXdCO1FBQy9CLFVBQVUsRUFBRSxRQUFRO1FBQ3BCLFVBQVUsRUFBRSxRQUFRO1FBQ3BCLFdBQVcsRUFBRSxRQUFRO1FBQ3JCLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLFlBQVksRUFBRSxVQUFVO1FBQ3hCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsZ0JBQWdCLEVBQUUsYUFBYTtRQUMvQixjQUFjLEVBQUUsZUFBZTtLQUNsQyxDQUFDO0lBRUYsWUFBWTtJQUNaLElBQUksT0FBTyxFQUFF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