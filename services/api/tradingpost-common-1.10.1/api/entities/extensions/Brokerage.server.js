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
const api_1 = require("../../../brokerage/robinhood/api");
const pingUrl = (id) => `https://api.robinhood.com/push/${id}/get_prompts_status`;
const pingMap = {
    "redeemed": Brokerage_1.RobinhoodChallengeStatus.Redeemed,
    "issued": Brokerage_1.RobinhoodChallengeStatus.Issued,
    "validated": Brokerage_1.RobinhoodChallengeStatus.Validated
};
const generatePayloadRequest = (clientId, expiresIn, scope, username, password, fauxDeviceToken, mfaCode, challengeResponseId) => {
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
    let headers = {};
    // MFA Login
    if (mfaCode) {
        payload["mfa_code"] = mfaCode;
        payload["try_passkeys"] = false;
        if (challengeResponseId)
            headers['x-robinhood-challenge-response-id'] = challengeResponseId;
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
        let { username, password, mfaCode } = req.body;
        const { pgp, pgClient, sqsClient } = yield db_1.init;
        const brokerageRepo = new repository_1.default(pgClient, pgp);
        let robinhoodUser = yield brokerageRepo.getRobinhoodUser(req.extra.userId, req.body.username);
        if (!robinhoodUser) {
            const newDeviceToken = (0, uuid_1.v4)();
            const [requestHeaders, requestPayload] = generatePayloadRequest(robinhoodCredentials.clientId, robinhoodCredentials.expiresIn, robinhoodCredentials.scope, username, password, newDeviceToken, mfaCode, null);
            try {
                const loginBody = yield (0, api_1.login)(requestPayload, requestHeaders);
                // Credentials Provided Incorrectly
                if (loginBody.detail && loginBody.detail === 'Unable to log in with provided credentials.')
                    return {
                        status: Brokerage_1.RobinhoodLoginStatus.ERROR,
                        body: "Credentials provided incorrectly",
                        challengeType: null
                    };
                let rhUser = {
                    username: username,
                    deviceToken: newDeviceToken,
                    usesMfa: false,
                    status: Brokerage_1.RobinhoodLoginStatus.SUCCESS,
                    accessToken: loginBody.access_token ? loginBody.access_token : null,
                    refreshToken: loginBody.refresh_token ? loginBody.refresh_token : null,
                    userId: req.extra.userId,
                    mfaType: null,
                    challengeResponseId: null,
                };
                let response = {
                    status: Brokerage_1.RobinhoodLoginStatus.SUCCESS,
                    body: "Robinhood account successfully updated in TradingPost",
                    challengeType: null,
                    challengeResponseId: ''
                };
                if ('mfa_required' in loginBody) {
                    const { mfa_required, mfa_type } = loginBody;
                    response = {
                        status: Brokerage_1.RobinhoodLoginStatus.MFA,
                        body: "MFA required to proceed",
                        challengeResponseId: '',
                        challengeType: "app"
                    };
                    // Authenticator App
                    rhUser.mfaType = "app";
                    rhUser.status = Brokerage_1.RobinhoodLoginStatus.MFA;
                    rhUser.usesMfa = true;
                }
                if ('challenge' in loginBody) {
                    if (loginBody.challenge.type === 'sms') {
                        response = {
                            status: Brokerage_1.RobinhoodLoginStatus.MFA,
                            body: "MFA required to proceed",
                            challengeResponseId: loginBody.challenge.id,
                            challengeType: "sms"
                        };
                        rhUser.mfaType = "sms";
                        rhUser.status = Brokerage_1.RobinhoodLoginStatus.MFA;
                        rhUser.usesMfa = true;
                        rhUser.challengeResponseId = loginBody.challenge.id;
                    }
                    if (loginBody.challenge.type === 'prompt') {
                        response = {
                            status: Brokerage_1.RobinhoodLoginStatus.DEVICE_APPROVAL,
                            body: "Please, approve the login on your device.",
                            challengeResponseId: loginBody.challenge.id,
                            challengeType: Brokerage_1.RobinhoodLoginStatus.DEVICE_APPROVAL
                        };
                        rhUser.mfaType = "prompt";
                        rhUser.status = Brokerage_1.RobinhoodLoginStatus.DEVICE_APPROVAL;
                        rhUser.usesMfa = true;
                        rhUser.challengeResponseId = loginBody.challenge.id;
                    }
                }
                yield brokerageRepo.insertRobinhoodUser(rhUser);
                if (response.status === Brokerage_1.RobinhoodLoginStatus.SUCCESS)
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
                return response;
            }
            catch (e) {
                console.error(e);
                return {
                    status: Brokerage_1.RobinhoodLoginStatus.ERROR,
                    body: e instanceof Error ? e.toString() : "Something went wrong trying to add your Robinhood account to TradingPost.",
                    challengeResponseId: '',
                    challengeType: null,
                };
            }
        }
        let [requestHeaders, requestPayload] = generatePayloadRequest(robinhoodCredentials.clientId, robinhoodCredentials.expiresIn, robinhoodCredentials.scope, username, password, robinhoodUser.deviceToken, mfaCode, robinhoodUser.challengeResponseId);
        if (mfaCode && robinhoodUser.mfaType === 'sms') {
            if (!robinhoodUser.challengeResponseId) {
                console.error("we did not set the challenge response id on request, validate!");
                return {
                    status: Brokerage_1.RobinhoodLoginStatus.ERROR,
                    body: "internal error, please contact TradingPost @ contact@tradingpostapp.com",
                    challengeResponseId: '',
                    challengeType: null
                };
            }
            // If request successful we do not need to do anything else, just make a normal login call
            const authResponse = yield (0, api_1.challengeRequest)(robinhoodUser.challengeResponseId, mfaCode, requestHeaders);
            if (authResponse.detail) {
                yield brokerageRepo.updateRobinhoodUser({
                    userId: robinhoodUser.userId,
                    mfaType: robinhoodUser.mfaType,
                    usesMfa: robinhoodUser.usesMfa,
                    status: robinhoodUser.status,
                    accessToken: robinhoodUser.accessToken,
                    username: robinhoodUser.username,
                    deviceToken: robinhoodUser.deviceToken,
                    refreshToken: robinhoodUser.refreshToken,
                    challengeResponseId: authResponse.challenge.id
                });
                return {
                    status: Brokerage_1.RobinhoodLoginStatus.ERROR,
                    body: "Could not authenticate Robinhood account with that passcode, try again",
                    challengeType: 'sms',
                    challengeResponseId: authResponse.challenge.id,
                };
            }
            // Remove mfa_code from payload! Breaks....
            delete requestPayload["mfa_code"];
        }
        try {
            const loginBody = yield (0, api_1.login)(requestPayload, requestHeaders);
            if ('mfa_required' in loginBody) {
                const { mfa_required, mfa_type } = loginBody;
                yield brokerageRepo.updateRobinhoodUser({
                    userId: robinhoodUser.userId,
                    mfaType: robinhoodUser.mfaType,
                    usesMfa: robinhoodUser.usesMfa,
                    status: robinhoodUser.status,
                    accessToken: loginBody.access_token,
                    username: robinhoodUser.username,
                    deviceToken: robinhoodUser.deviceToken,
                    refreshToken: loginBody.refresh_token,
                    challengeResponseId: null
                });
                return {
                    status: Brokerage_1.RobinhoodLoginStatus.MFA,
                    body: "MFA required to proceed",
                    challengeResponseId: '',
                    challengeType: "app"
                };
            }
            if ('challenge' in loginBody) {
                if (loginBody.challenge.type === 'sms') {
                    yield brokerageRepo.updateRobinhoodUser({
                        userId: robinhoodUser.userId,
                        mfaType: 'sms',
                        usesMfa: true,
                        status: Brokerage_1.RobinhoodLoginStatus.MFA,
                        accessToken: loginBody.access_token,
                        username: robinhoodUser.username,
                        deviceToken: robinhoodUser.deviceToken,
                        refreshToken: loginBody.refresh_token,
                        challengeResponseId: loginBody.challenge.id
                    });
                    return {
                        status: Brokerage_1.RobinhoodLoginStatus.MFA,
                        body: "MFA required to proceed",
                        challengeResponseId: loginBody.challenge.id,
                        challengeType: "sms"
                    };
                }
                if (loginBody.challenge.type === 'prompt') {
                    yield brokerageRepo.updateRobinhoodUser({
                        userId: robinhoodUser.userId,
                        mfaType: 'prompt',
                        usesMfa: true,
                        status: Brokerage_1.RobinhoodLoginStatus.DEVICE_APPROVAL,
                        accessToken: loginBody.access_token,
                        username: robinhoodUser.username,
                        deviceToken: robinhoodUser.deviceToken,
                        refreshToken: loginBody.refresh_token,
                        challengeResponseId: loginBody.challenge.id
                    });
                    return {
                        status: Brokerage_1.RobinhoodLoginStatus.DEVICE_APPROVAL,
                        body: "Please, approve the login on your device.",
                        challengeResponseId: loginBody.challenge.id,
                        challengeType: Brokerage_1.RobinhoodLoginStatus.DEVICE_APPROVAL
                    };
                }
            }
            yield brokerageRepo.updateRobinhoodUser({
                userId: robinhoodUser.userId,
                mfaType: robinhoodUser.mfaType,
                usesMfa: robinhoodUser.usesMfa,
                status: Brokerage_1.RobinhoodLoginStatus.SUCCESS,
                accessToken: loginBody.access_token,
                username: robinhoodUser.username,
                deviceToken: robinhoodUser.deviceToken,
                refreshToken: loginBody.refresh_token,
                challengeResponseId: null
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
                body: "Robinhood account successfully updated in TradingPost",
                challengeType: null,
                challengeResponseId: ''
            };
        }
        catch (e) {
            console.error(e);
            return {
                status: Brokerage_1.RobinhoodLoginStatus.ERROR,
                body: e instanceof Error ? e.toString() : "Something went wrong trying to add your Robinhood account to TradingPost.",
                challengeResponseId: '',
                challengeType: null,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJva2VyYWdlLnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJyb2tlcmFnZS5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFDekMsMkNBQThHO0FBQzlHLCtCQUFrQztBQUNsQyw0REFBK0I7QUFDL0IsOERBT3VDO0FBQ3ZDLG9DQUFpQztBQUNqQywrRUFBdUQ7QUFDdkQsMERBQXFEO0FBQ3JELGlDQUErQjtBQUMvQixvREFBdUQ7QUFDdkQsNEVBQTZFO0FBQzdFLDBEQUF5RTtBQUd6RSxNQUFNLE9BQU8sR0FBRyxDQUFDLEVBQVUsRUFBRSxFQUFFLENBQUMsa0NBQWtDLEVBQUUscUJBQXFCLENBQUM7QUFDMUYsTUFBTSxPQUFPLEdBQTJCO0lBQ3BDLFVBQVUsRUFBRSxvQ0FBd0IsQ0FBQyxRQUFRO0lBQzdDLFFBQVEsRUFBRSxvQ0FBd0IsQ0FBQyxNQUFNO0lBQ3pDLFdBQVcsRUFBRSxvQ0FBd0IsQ0FBQyxTQUFTO0NBQ2xELENBQUE7QUFFRCxNQUFNLHNCQUFzQixHQUFHLENBQUMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLEtBQWEsRUFBRSxRQUFnQixFQUFFLFFBQWdCLEVBQUUsZUFBdUIsRUFBRSxPQUFzQixFQUFFLG1CQUFrQyxFQUE4QyxFQUFFO0lBQ3ZQLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMxQixJQUFJLE9BQU8sR0FBd0I7UUFDL0IsVUFBVSxFQUFFLFFBQVE7UUFDcEIsVUFBVSxFQUFFLFFBQVE7UUFDcEIsV0FBVyxFQUFFLFFBQVE7UUFDckIsWUFBWSxFQUFFLFNBQVM7UUFDdkIsWUFBWSxFQUFFLFVBQVU7UUFDeEIsT0FBTyxFQUFFLEtBQUs7UUFDZCxnQkFBZ0IsRUFBRSxhQUFhO1FBQy9CLGNBQWMsRUFBRSxlQUFlO0tBQ2xDLENBQUM7SUFFRixJQUFJLE9BQU8sR0FBMkIsRUFBRSxDQUFDO0lBRXpDLFlBQVk7SUFDWixJQUFJLE9BQU8sRUFB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