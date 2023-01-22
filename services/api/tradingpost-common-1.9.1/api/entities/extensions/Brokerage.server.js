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
        const { pgp, pgClient } = yield db_1.init;
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
            yield brokerageRepo.upsertTradingPostBrokerageAccounts([{
                    status: "active",
                    userId: req.extra.userId,
                    type: "brokerage",
                    brokerName: "Robinhood",
                    institutionId: 9858,
                    accountNumber: username,
                    name: "",
                    mask: "",
                    errorCode: 0,
                    error: false,
                    officialName: "",
                    subtype: "",
                    hiddenForDeletion: false,
                    accountStatus: interfaces_1.TradingPostBrokerageAccountStatus.PROCESSING
                }]);
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
            console.log(body);
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
        const { pgp, pgClient } = yield db_1.init;
        const brokerageRepo = new repository_1.default(pgClient, pgp);
        const tpAccount = yield brokerageRepo.getTradingPostBrokerageAccount(req.body.accountId);
        yield brokerageRepo.upsertBrokerageTasks([
            {
                status: interfaces_1.BrokerageTaskStatusType.Pending,
                date: luxon_1.DateTime.now(),
                userId: req.extra.userId,
                type: interfaces_1.BrokerageTaskType.DeleteAccount,
                started: null,
                finished: null,
                data: { brokerage: req.body.brokerage, accountId: req.body.accountId },
                error: null,
                brokerageUserId: tpAccount.accountNumber,
                brokerage: req.body.brokerage
            }
        ]);
        yield brokerageRepo.scheduleTradingPostAccountForDeletion(req.body.accountId);
        return {};
    }),
    createIbkrAccounts: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const { pgp, pgClient } = yield db_1.init;
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
                officialName: null
            };
            return x;
        });
        yield repository.upsertTradingPostBrokerageAccounts(tpAccounts);
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJva2VyYWdlLnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJyb2tlcmFnZS5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFFekMsMkNBQThHO0FBQzlHLCtCQUFrQztBQUNsQyw0REFBK0I7QUFDL0IsOERBT3VDO0FBQ3ZDLG9DQUFpQztBQUNqQywrRUFBdUQ7QUFDdkQsMERBQXFEO0FBQ3JELGlDQUErQjtBQUUvQixNQUFNLFFBQVEsR0FBRyx5Q0FBeUMsQ0FBQztBQUMzRCxNQUFNLE9BQU8sR0FBRyxDQUFDLEVBQVUsRUFBRSxFQUFFLENBQUMsa0NBQWtDLEVBQUUscUJBQXFCLENBQUM7QUFDMUYsTUFBTSxPQUFPLEdBQTJCO0lBQ3BDLFVBQVUsRUFBRSxvQ0FBd0IsQ0FBQyxRQUFRO0lBQzdDLFFBQVEsRUFBRSxvQ0FBd0IsQ0FBQyxNQUFNO0lBQ3pDLFdBQVcsRUFBRSxvQ0FBd0IsQ0FBQyxTQUFTO0NBQ2xELENBQUE7QUFFRCxNQUFNLHNCQUFzQixHQUFHLENBQUMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLEtBQWEsRUFBRSxRQUFnQixFQUFFLFFBQWdCLEVBQUUsZUFBdUIsRUFBRSxPQUErQixFQUFFLE9BQXNCLEVBQUUsbUJBQWtDLEVBQThDLEVBQUU7SUFDeFIsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBQzFCLElBQUksT0FBTyxHQUF3QjtRQUMvQixVQUFVLEVBQUUsUUFBUTtRQUNwQixVQUFVLEVBQUUsUUFBUTtRQUNwQixXQUFXLEVBQUUsUUFBUTtRQUNyQixZQUFZLEVBQUUsU0FBUztRQUN2QixZQUFZLEVBQUUsVUFBVTtRQUN4QixPQUFPLEVBQUUsS0FBSztRQUNkLGdCQUFnQixFQUFFLGFBQWE7UUFDL0IsY0FBYyxFQUFFLGVBQWU7S0FDbEMsQ0FBQztJQUVGLFlBQVk7SUFDWixJQUFJLE9BQU8sRUFBRTtRQUNULE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUE7UUFDN0IsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM3QjtJQUVELElBQUksbUJBQW1CLEVBQUU7UUFDckIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUNoQyxPQUFPLENBQUMsbUNBQW1DLENBQUMsR0FBRyxtQkFBbUIsQ0FBQTtRQUNsRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzdCO0lBRUQsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5QixDQUFDLENBQUE7QUFFRCwyRUFBMkU7QUFFM0Usa0JBQWUsSUFBQSx5QkFBc0IsRUFBWTtJQUM3QyxjQUFjLEVBQUUsQ0FBTyxHQUFHLEVBQW1DLEVBQUU7UUFDM0QsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDcEUsTUFBTSxFQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUMsR0FBRyxNQUFNLFNBQUksQ0FBQztRQUNuQyxNQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXBELElBQUksa0JBQWtCLEdBQTZDLElBQUksQ0FBQztRQUN4RSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sYUFBYSxDQUFDLGdEQUFnRCxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDNUksSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztRQUNwSCxJQUFJLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQUUsa0JBQWtCLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEYsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssUUFBUTtZQUFFLE9BQU87Z0JBQ3JFLE1BQU0sRUFBRSxnQ0FBb0IsQ0FBQyxPQUFPO2dCQUNwQyxJQUFJLEVBQUUsZ0RBQWdEO2FBQ3pELENBQUE7UUFFRCxJQUFJLE9BQU8sR0FBMkI7WUFDbEMsY0FBYyxFQUFFLGtCQUFrQjtZQUNsQyxRQUFRLEVBQUUsa0JBQWtCO1lBQzVCLHlCQUF5QixFQUFFLFNBQVM7U0FDdkMsQ0FBQTtRQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0UsSUFBSSxlQUFlLEdBQUcsSUFBQSxTQUFNLEdBQUUsQ0FBQztRQUMvQixJQUFJLGFBQWE7WUFBRSxlQUFlLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQTtRQUU5RCxNQUFNLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFDekYsb0JBQW9CLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFDL0YsT0FBTyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBRTNDLElBQUk7WUFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsb0JBQUssRUFBQyxRQUFRLEVBQUU7Z0JBQ25DLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRSxjQUFjO2dCQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7YUFDdkMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFbkMsbUNBQW1DO1lBQ25DLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLDZDQUE2QztnQkFBRSxPQUFPO29CQUN6RSxNQUFNLEVBQUUsZ0NBQW9CLENBQUMsS0FBSztvQkFDbEMsSUFBSSxFQUFFLGtDQUFrQztpQkFDM0MsQ0FBQTtZQUVELElBQUksQ0FBQyxhQUFhO2dCQUNkLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO29CQUNwQyxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsV0FBVyxFQUFFLGVBQWU7b0JBQzVCLE9BQU8sRUFBRSxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDeEUsTUFBTSxFQUFFLGdDQUFvQixDQUFDLE9BQU87b0JBQ3BDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUN6RCxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDNUQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtpQkFDM0IsQ0FBQyxDQUFBO1lBRU4sWUFBWTtZQUNaLCtCQUErQjtZQUMvQixJQUFJLGNBQWMsSUFBSSxJQUFJO2dCQUFFLE9BQU87b0JBQy9CLE1BQU0sRUFBRSxnQ0FBb0IsQ0FBQyxHQUFHO29CQUNoQyxJQUFJLEVBQUUseUJBQXlCO2lCQUNsQyxDQUFBO1lBRUQsSUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO2dCQUNyQixrREFBa0Q7Z0JBQ2xELElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVE7b0JBQUUsT0FBTzt3QkFDakQsTUFBTSxFQUFFLGdDQUFvQixDQUFDLGVBQWU7d0JBQzVDLElBQUksRUFBRSwyQ0FBMkM7d0JBQ2pELG1CQUFtQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQy9DLENBQUM7YUFFTDtZQUVELDZEQUE2RDtZQUM3RCxNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDcEMsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYTtnQkFDaEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDeEIsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUM5QixNQUFNLEVBQUUsZ0NBQW9CLENBQUMsT0FBTztnQkFDcEMsT0FBTyxFQUFFLE9BQU8sS0FBSyxJQUFJO2dCQUN6QixXQUFXLEVBQUUsZUFBZTthQUMvQixDQUFDLENBQUM7WUFFSCxNQUFNLGFBQWEsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLEVBQUUsUUFBUTtvQkFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtvQkFDeEIsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLFVBQVUsRUFBRSxXQUFXO29CQUN2QixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsYUFBYSxFQUFFLFFBQVE7b0JBQ3ZCLElBQUksRUFBRSxFQUFFO29CQUNSLElBQUksRUFBRSxFQUFFO29CQUNSLFNBQVMsRUFBRSxDQUFDO29CQUNaLEtBQUssRUFBRSxLQUFLO29CQUNaLFlBQVksRUFBRSxFQUFFO29CQUNoQixPQUFPLEVBQUUsRUFBRTtvQkFDWCxpQkFBaUIsRUFBRSxLQUFLO29CQUN4QixhQUFhLEVBQUUsOENBQWlDLENBQUMsVUFBVTtpQkFDOUQsQ0FBQyxDQUFDLENBQUE7WUFFSCxPQUFPO2dCQUNILE1BQU0sRUFBRSxnQ0FBb0IsQ0FBQyxPQUFPO2dCQUNwQyxJQUFJLEVBQUUsdURBQXVEO2FBQ2hFLENBQUE7U0FDSjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNoQixPQUFPO2dCQUNILE1BQU0sRUFBRSxnQ0FBb0IsQ0FBQyxLQUFLO2dCQUNsQyxJQUFJLEVBQUUsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQywyRUFBMkU7YUFDeEgsQ0FBQTtTQUNKO0lBQ0wsQ0FBQyxDQUFBO0lBQ0QsUUFBUSxFQUFFLENBQU8sR0FBRyxFQUEwRCxFQUFFO1FBQzVFLE1BQU0sRUFBQyxTQUFTLEVBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQzdCLElBQUk7WUFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsb0JBQUssRUFBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzdDLE1BQU0sRUFBRSxLQUFLO2FBQ2hCLENBQUMsQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxFQUFDLGVBQWUsRUFBRSxvQ0FBd0IsQ0FBQyxPQUFPLEVBQUMsQ0FBQTthQUM3RDtZQUVELElBQUksSUFBSSxDQUFDLGdCQUEwQixJQUFJLE9BQU8sRUFBRTtnQkFDNUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUEwQixDQUFBO2dCQUN2RCxPQUFPO29CQUNILGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUE2QjtpQkFDeEUsQ0FBQTthQUNKO1lBRUQsT0FBTztnQkFDSCxlQUFlLEVBQUUsb0NBQXdCLENBQUMsT0FBTzthQUNwRCxDQUFBO1NBQ0o7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsT0FBTyxFQUFDLGVBQWUsRUFBRSxvQ0FBd0IsQ0FBQyxPQUFPLEVBQUMsQ0FBQTtTQUM3RDtJQUNMLENBQUMsQ0FBQTtJQUNELG1CQUFtQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDL0IscUVBQXFFO1FBQ3JFLE1BQU0sRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFDLEdBQUcsTUFBTSxTQUFJLENBQUM7UUFDbkMsTUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwRCxNQUFNLFNBQVMsR0FBRyxNQUFNLGFBQWEsQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sYUFBYSxDQUFDLG9CQUFvQixDQUFDO1lBQ3JDO2dCQUNJLE1BQU0sRUFBRSxvQ0FBdUIsQ0FBQyxPQUFPO2dCQUN2QyxJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BCLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQ3hCLElBQUksRUFBRSw4QkFBaUIsQ0FBQyxhQUFhO2dCQUNyQyxPQUFPLEVBQUUsSUFBSTtnQkFDYixRQUFRLEVBQUUsSUFBSTtnQkFDZCxJQUFJLEVBQUUsRUFBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDO2dCQUNwRSxLQUFLLEVBQUUsSUFBSTtnQkFDWCxlQUFlLEVBQUUsU0FBUyxDQUFDLGFBQWE7Z0JBQ3hDLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVM7YUFDaEM7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLGFBQWEsQ0FBQyxxQ0FBcUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlFLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFBO0lBQ0Qsa0JBQWtCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUM5QixNQUFNLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBQyxHQUFHLE1BQU0sU0FBSSxDQUFDO1FBQ25DLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQy9DLElBQUksQ0FBQyxHQUFnQjtnQkFDakIsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsZUFBZSxFQUFFLEVBQUU7Z0JBQ25CLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQ3hCLEdBQUcsRUFBRSxJQUFJO2dCQUNULFlBQVksRUFBRSxJQUFJO2dCQUNsQixXQUFXLEVBQUUsSUFBSTtnQkFDakIsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsSUFBSSxFQUFFLElBQUk7Z0JBQ1YscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsZ0JBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFCLEtBQUssRUFBRSxJQUFJO2dCQUNYLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2dCQUNiLFlBQVksRUFBRSxJQUFJO2dCQUNsQixrQkFBa0IsRUFBRSxnQkFBUSxDQUFDLEdBQUcsRUFBRTthQUNyQyxDQUFBO1lBQ0QsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sVUFBVSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWxELE1BQU0sZUFBZSxHQUFHLE1BQU0sVUFBVSxDQUFDLG9CQUFvQixDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDMUcsSUFBSSxDQUFDLGVBQWU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFFdEUsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzdDLElBQUksQ0FBQyxHQUFpQztnQkFDbEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLDhDQUFpQyxDQUFDLFVBQVU7Z0JBQzNELEtBQUssRUFBRSxLQUFLO2dCQUNaLElBQUksRUFBRSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxFQUFFO2dCQUNWLGlCQUFpQixFQUFFLEtBQUs7Z0JBQ3hCLFNBQVMsRUFBRSxDQUFDO2dCQUNaLElBQUksRUFBRSxJQUFJO2dCQUNWLGFBQWEsRUFBRSxlQUFlLGFBQWYsZUFBZSx1QkFBZixlQUFlLENBQUUsRUFBRTtnQkFDbEMsVUFBVSxFQUFFLGlDQUFvQixDQUFDLElBQUk7Z0JBQ3JDLGFBQWEsRUFBRSxFQUFFO2dCQUNqQixJQUFJLEVBQUUsRUFBRTtnQkFDUixPQUFPLEVBQUUsSUFBSTtnQkFDYixZQUFZLEVBQUUsSUFBSTthQUNyQixDQUFBO1lBQ0QsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQTtRQUNGLE1BQU0sVUFBVSxDQUFDLGtDQUFrQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWhFLE9BQU8sRUFBRSxDQUFBO0lBQ2IsQ0FBQyxDQUFBO0NBQ0osQ0FBQyxDQUFBIn0=