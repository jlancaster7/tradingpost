import {ensureServerExtensions} from ".";
import Brokerage from "./Brokerage";
import brokerage, {RobinhoodChallengeStatus, RobinhoodLoginResponse, RobinhoodLoginStatus} from "./Brokerage";
import {v4 as uuidv4} from 'uuid';
import fetch from 'node-fetch';
import {
    BrokerageTaskStatusType,
    BrokerageTaskType, DirectBrokeragesType,
    IbkrAccount,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountsTable,
    TradingPostBrokerageAccountStatus
} from "../../../brokerage/interfaces";
import {init} from "../../../db";
import Repository from "../../../brokerage/repository";
import {DefaultConfig} from "../../../configuration";
import {DateTime} from "luxon";

const loginUrl = 'https://api.robinhood.com/oauth2/token/';
const pingUrl = (id: string) => `https://api.robinhood.com/push/${id}/get_prompts_status`;
const pingMap: Record<string, string> = {
    "redeemed": RobinhoodChallengeStatus.Redeemed,
    "issued": RobinhoodChallengeStatus.Issued,
    "validated": RobinhoodChallengeStatus.Validated
}

const generatePayloadRequest = (clientId: string, expiresIn: number, scope: string, username: string, password: string, fauxDeviceToken: string, headers: Record<string, string>, mfaCode: string | null, challengeResponseId: string | null): [Record<string, string>, Record<any, any>] => {
    let challengeType = "sms";
    let payload: Record<string, any> = {
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
        payload["mfa_code"] = mfaCode
        return [headers, payload];
    }

    if (challengeResponseId) {
        payload["try_passkeys"] = false;
        headers['x-robinhood-challenge-response-id'] = challengeResponseId
        return [headers, payload];
    }

    return [headers, payload];
}

// We want to build different requests based on different requesting states

export default ensureServerExtensions<Brokerage>({
    robinhoodLogin: async (req): Promise<RobinhoodLoginResponse> => {
        const robinhoodCredentials = await DefaultConfig.fromCacheOrSSM("robinhood");
        const {username, password, mfaCode, challengeResponseId} = req.body;
        const {pgp, pgClient} = await init;
        const brokerageRepo = new Repository(pgClient, pgp);

        let tpBrokerageAccount: TradingPostBrokerageAccountsTable | null = null;
        const tpBrokerageAccounts = await brokerageRepo.getTradingPostBrokerageAccountsByBrokerageAndIds(req.extra.userId, "Robinhood", [username]);
        if (tpBrokerageAccounts.length > 1) throw new Error("cant have more than one brokerage account for robinhood user");
        if (tpBrokerageAccounts.length > 0) tpBrokerageAccount = tpBrokerageAccounts[0];

        if (tpBrokerageAccount && tpBrokerageAccount.status === 'active') return {
            status: RobinhoodLoginStatus.SUCCESS,
            body: "Robinhood account already exists and is active"
        }

        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-robinhood-api-version': '1.431.4'
        }

        const robinhoodUser = await brokerageRepo.getRobinhoodUser(req.extra.userId);
        let fauxDeviceToken = uuidv4();
        if (robinhoodUser) fauxDeviceToken = robinhoodUser.deviceToken

        const [requestHeaders, requestPayload] = generatePayloadRequest(robinhoodCredentials.clientId,
            robinhoodCredentials.expiresIn, robinhoodCredentials.scope, username, password, fauxDeviceToken,
            headers, mfaCode, challengeResponseId);

        try {
            const response = await fetch(loginUrl, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestPayload)
            });

            const body = await response.json();

            // Credentials Provided Incorrectly
            if (body['detail'] === 'Unable to log in with provided credentials.') return {
                status: RobinhoodLoginStatus.ERROR,
                body: "Credentials provided incorrectly"
            }

            if (!robinhoodUser)
                await brokerageRepo.insertRobinhoodUser({
                    username: username,
                    deviceToken: fauxDeviceToken,
                    usesMfa: mfaCode !== null && !body['mfa_required'] && !body['challenge'],
                    status: RobinhoodLoginStatus.SUCCESS,
                    accessToken: body.access_token ? body.access_token : null,
                    refreshToken: body.refresh_token ? body.refresh_token : null,
                    userId: req.extra.userId
                })

            // Basic MFA
            // Have them type in a passcode
            if ('mfa_required' in body) return {
                status: RobinhoodLoginStatus.MFA,
                body: "MFA required to proceed"
            }

            if ('challenge' in body) {
                // this is the challenge where you constantly ping
                if (body['challenge']['status'] === 'issued') return {
                    status: RobinhoodLoginStatus.DEVICE_APPROVAL,
                    body: "Please, approve the login on your device.",
                    challengeResponseId: body['challenge']['id'],
                };

            }

            // Made it through authentication and we have an access token
            await brokerageRepo.updateRobinhoodUser({
                username: username,
                refreshToken: body.refresh_token,
                userId: req.extra.userId,
                accessToken: body.access_token,
                status: RobinhoodLoginStatus.SUCCESS,
                usesMfa: mfaCode !== null,
                deviceToken: fauxDeviceToken,
            });

            await brokerageRepo.upsertTradingPostBrokerageAccounts([{
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
                accountStatus: TradingPostBrokerageAccountStatus.PROCESSING
            }])

            return {
                status: RobinhoodLoginStatus.SUCCESS,
                body: "Robinhood account successfully updated in TradingPost"
            }
        } catch (e) {
            console.error(e)
            return {
                status: RobinhoodLoginStatus.ERROR,
                body: e instanceof Error ? e.toString() : "Something went wrong trying to add your Robinhood account to TradingPost."
            }
        }
    },
    hoodPing: async (req): Promise<{ challengeStatus: RobinhoodChallengeStatus }> => {
        const {requestId} = req.body;
        try {
            const response = await fetch(pingUrl(requestId), {
                method: "GET"
            });
            const body = await response.json();
            console.log(body);
            if ('detail' in body) {
                console.error("pinging the hood for challenge status: ", body.detail);
                return {challengeStatus: RobinhoodChallengeStatus.Unknown}
            }

            if (body.challenge_status as string in pingMap) {
                const challengeStatus = body.challenge_status as string
                return {
                    challengeStatus: pingMap[challengeStatus] as RobinhoodChallengeStatus
                }
            }

            return {
                challengeStatus: RobinhoodChallengeStatus.Unknown
            }
        } catch (e) {
            console.error(e);
            return {challengeStatus: RobinhoodChallengeStatus.Unknown}
        }
    },
    scheduleForDeletion: async (req) => {
        // Change TP account ID to hidden and publish event to remove account
        const {pgp, pgClient} = await init;
        const brokerageRepo = new Repository(pgClient, pgp);
        const tpAccount = await brokerageRepo.getTradingPostBrokerageAccount(req.body.accountId);
        await brokerageRepo.upsertBrokerageTasks([
            {
                status: BrokerageTaskStatusType.Pending,
                date: DateTime.now(),
                userId: req.extra.userId,
                type: BrokerageTaskType.DeleteAccount,
                started: null,
                finished: null,
                data: {brokerage: req.body.brokerage, accountId: req.body.accountId},
                error: null,
                brokerageUserId: tpAccount.accountNumber,
                brokerage: req.body.brokerage
            }
        ]);

        await brokerageRepo.scheduleTradingPostAccountForDeletion(req.body.accountId);
        return {};
    },
    createIbkrAccounts: async (req) => {
        const {pgp, pgClient} = await init;
        const repository = new Repository(pgClient, pgp);
        const ibkrAccounts = req.body.account_ids.map(ai => {
            let x: IbkrAccount = {
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
                dateOpened: DateTime.now(),
                state: null,
                street: null,
                street2: null,
                primaryEmail: null,
                accountProcessDate: DateTime.now()
            }
            return x;
        });
        await repository.upsertIbkrAccounts(ibkrAccounts);

        const ibkrInstitution = await repository.getInstitutionByName("Interactive Brokers - Account Management");
        if (!ibkrInstitution) throw new Error("no institution found by name");

        const tpAccounts = req.body.account_ids.map(ai => {
            let x: TradingPostBrokerageAccounts = {
                userId: req.extra.userId,
                accountStatus: TradingPostBrokerageAccountStatus.PROCESSING,
                error: false,
                type: '',
                status: '',
                hiddenForDeletion: false,
                errorCode: 0,
                mask: null,
                institutionId: ibkrInstitution?.id,
                brokerName: DirectBrokeragesType.Ibkr,
                accountNumber: ai,
                name: '',
                subtype: null,
                officialName: null
            }
            return x;
        })
        await repository.upsertTradingPostBrokerageAccounts(tpAccounts);

        return {}
    }
})
