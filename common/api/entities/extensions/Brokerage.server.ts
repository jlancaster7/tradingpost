import {ensureServerExtensions} from ".";
import Brokerage, {RobinhoodChallengeStatus, RobinhoodLoginResponse, RobinhoodLoginStatus} from "./Brokerage";
import {v4 as uuidv4} from 'uuid';
import fetch from 'node-fetch';
import {
    BrokerageTaskStatusType,
    BrokerageTaskType,
    DirectBrokeragesType,
    IbkrAccount,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountStatus
} from "../../../brokerage/interfaces";
import {init} from "../../../db";
import Repository from "../../../brokerage/repository";
import {DefaultConfig} from "../../../configuration";
import {DateTime} from "luxon";
import {SendMessageCommand} from '@aws-sdk/client-sqs';
import {PortfolioSummaryService} from "../../../brokerage/portfolio-summary";
import {challengeRequest, login} from "../../../brokerage/robinhood/api";
import {RobinhoodUser} from "../../../brokerage/robinhood/interfaces";

const pingUrl = (id: string) => `https://api.robinhood.com/push/${id}/get_prompts_status`;
const pingMap: Record<string, string> = {
    "redeemed": RobinhoodChallengeStatus.Redeemed,
    "issued": RobinhoodChallengeStatus.Issued,
    "validated": RobinhoodChallengeStatus.Validated
}

const generatePayloadRequest = (clientId: string, expiresIn: number, scope: string, username: string, password: string, fauxDeviceToken: string, mfaCode: string | null, challengeResponseId: string | null): [Record<string, string>, Record<any, any>] => {
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

    let headers: Record<string, string> = {};

    // MFA Login
    if (mfaCode) {
        payload["mfa_code"] = mfaCode
        payload["try_passkeys"] = false;
        if (challengeResponseId) headers['x-robinhood-challenge-response-id'] = challengeResponseId
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
        let {username, password, mfaCode} = req.body;
        const {pgp, pgClient, sqsClient} = await init;
        const brokerageRepo = new Repository(pgClient, pgp);

        let robinhoodUser = await brokerageRepo.getRobinhoodUser(req.extra.userId, req.body.username);
        if (!robinhoodUser) {
            const newDeviceToken = uuidv4();
            const [requestHeaders, requestPayload] = generatePayloadRequest(robinhoodCredentials.clientId,
                robinhoodCredentials.expiresIn, robinhoodCredentials.scope, username, password, newDeviceToken, mfaCode, null);

            try {
                const loginBody = await login(requestPayload, requestHeaders);
                // Credentials Provided Incorrectly
                if (loginBody.detail && loginBody.detail === 'Unable to log in with provided credentials.') return {
                    status: RobinhoodLoginStatus.ERROR,
                    body: "Credentials provided incorrectly",
                    challengeType: null
                }

                let rhUser: RobinhoodUser = {
                    username: username,
                    deviceToken: newDeviceToken,
                    usesMfa: false,
                    status: RobinhoodLoginStatus.SUCCESS,
                    accessToken: loginBody.access_token ? loginBody.access_token : null,
                    refreshToken: loginBody.refresh_token ? loginBody.refresh_token : null,
                    userId: req.extra.userId,
                    mfaType: null,
                    challengeResponseId: null,
                };

                let response: RobinhoodLoginResponse = {
                    status: RobinhoodLoginStatus.SUCCESS,
                    body: "Robinhood account successfully updated in TradingPost",
                    challengeType: null,
                    challengeResponseId: ''
                };

                if ('mfa_required' in loginBody) {
                    const {mfa_required, mfa_type} = loginBody;
                    response = {
                        status: RobinhoodLoginStatus.MFA,
                        body: "MFA required to proceed",
                        challengeResponseId: '',
                        challengeType: "app"
                    }

                    // Authenticator App
                    rhUser.mfaType = "app";
                    rhUser.status = RobinhoodLoginStatus.MFA;
                    rhUser.usesMfa = true;
                }

                if ('challenge' in loginBody) {
                    if (loginBody.challenge.type === 'sms') {
                        response = {
                            status: RobinhoodLoginStatus.MFA,
                            body: "MFA required to proceed",
                            challengeResponseId: loginBody.challenge.id,
                            challengeType: "sms"
                        }

                        rhUser.mfaType = "sms";
                        rhUser.status = RobinhoodLoginStatus.MFA;
                        rhUser.usesMfa = true;
                        rhUser.challengeResponseId = loginBody.challenge.id
                    }

                    if (loginBody.challenge.type === 'prompt') {
                        response = {
                            status: RobinhoodLoginStatus.DEVICE_APPROVAL,
                            body: "Please, approve the login on your device.",
                            challengeResponseId: loginBody.challenge.id,
                            challengeType: RobinhoodLoginStatus.DEVICE_APPROVAL
                        };

                        rhUser.mfaType = "prompt";
                        rhUser.status = RobinhoodLoginStatus.DEVICE_APPROVAL;
                        rhUser.usesMfa = true;
                        rhUser.challengeResponseId = loginBody.challenge.id
                    }
                }

                await brokerageRepo.insertRobinhoodUser(rhUser);
                if (response.status === RobinhoodLoginStatus.SUCCESS) await sqsClient.send(new SendMessageCommand({
                    MessageBody: JSON.stringify({
                        type: BrokerageTaskType.NewAccount,
                        userId: req.extra.userId,
                        status: BrokerageTaskStatusType.Pending,
                        data: null,
                        started: null,
                        finished: null,
                        brokerage: DirectBrokeragesType.Robinhood,
                        date: DateTime.now().setZone("America/New_York"),
                        brokerageUserId: username,
                        error: null,
                        messageId: null
                    }),
                    DelaySeconds: 0,
                    QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
                }));

                return response
            } catch (e) {
                console.error(e)
                return {
                    status: RobinhoodLoginStatus.ERROR,
                    body: e instanceof Error ? e.toString() : "Something went wrong trying to add your Robinhood account to TradingPost.",
                    challengeResponseId: '',
                    challengeType: null,
                }
            }
        }

        let [requestHeaders, requestPayload] = generatePayloadRequest(robinhoodCredentials.clientId,
            robinhoodCredentials.expiresIn, robinhoodCredentials.scope, username, password, robinhoodUser.deviceToken, mfaCode, robinhoodUser.challengeResponseId);

        if (mfaCode && robinhoodUser.mfaType === 'sms') {
            if (!robinhoodUser.challengeResponseId) {
                console.error("we did not set the challenge response id on request, validate!");
                return {
                    status: RobinhoodLoginStatus.ERROR,
                    body: "internal error, please contact TradingPost @ contact@tradingpostapp.com",
                    challengeResponseId: '',
                    challengeType: null
                }
            }

            // If request successful we do not need to do anything else, just make a normal login call
            const authResponse = await challengeRequest(robinhoodUser.challengeResponseId, mfaCode, requestHeaders);
            if (authResponse.detail) {
                await brokerageRepo.updateRobinhoodUser({
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
                    status: RobinhoodLoginStatus.ERROR,
                    body: "Could not authenticate Robinhood account with that passcode, try again",
                    challengeType: 'sms',
                    challengeResponseId: authResponse.challenge.id,
                }
            }

            // Remove mfa_code from payload! Breaks....
            delete requestPayload["mfa_code"]
        }

        try {
            const loginBody = await login(requestPayload, requestHeaders);

            if ('mfa_required' in loginBody) {
                const {mfa_required, mfa_type} = loginBody;
                await brokerageRepo.updateRobinhoodUser({
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
                    status: RobinhoodLoginStatus.MFA,
                    body: "MFA required to proceed",
                    challengeResponseId: '',
                    challengeType: "app"
                }
            }

            if ('challenge' in loginBody) {
                if (loginBody.challenge.type === 'sms') {
                    await brokerageRepo.updateRobinhoodUser({
                        userId: robinhoodUser.userId,
                        mfaType: 'sms',
                        usesMfa: true,
                        status: RobinhoodLoginStatus.MFA,
                        accessToken: loginBody.access_token,
                        username: robinhoodUser.username,
                        deviceToken: robinhoodUser.deviceToken,
                        refreshToken: loginBody.refresh_token,
                        challengeResponseId: loginBody.challenge.id
                    });

                    return {
                        status: RobinhoodLoginStatus.MFA,
                        body: "MFA required to proceed",
                        challengeResponseId: loginBody.challenge.id,
                        challengeType: "sms"
                    }
                }

                if (loginBody.challenge.type === 'prompt') {
                    await brokerageRepo.updateRobinhoodUser({
                        userId: robinhoodUser.userId,
                        mfaType: 'prompt',
                        usesMfa: true,
                        status: RobinhoodLoginStatus.DEVICE_APPROVAL,
                        accessToken: loginBody.access_token,
                        username: robinhoodUser.username,
                        deviceToken: robinhoodUser.deviceToken,
                        refreshToken: loginBody.refresh_token,
                        challengeResponseId: loginBody.challenge.id
                    });

                    return {
                        status: RobinhoodLoginStatus.DEVICE_APPROVAL,
                        body: "Please, approve the login on your device.",
                        challengeResponseId: loginBody.challenge.id,
                        challengeType: RobinhoodLoginStatus.DEVICE_APPROVAL
                    };
                }
            }

            await brokerageRepo.updateRobinhoodUser({
                userId: robinhoodUser.userId,
                mfaType: robinhoodUser.mfaType,
                usesMfa: robinhoodUser.usesMfa,
                status: RobinhoodLoginStatus.SUCCESS,
                accessToken: loginBody.access_token,
                username: robinhoodUser.username,
                deviceToken: robinhoodUser.deviceToken,
                refreshToken: loginBody.refresh_token,
                challengeResponseId: null
            });

            await sqsClient.send(new SendMessageCommand({
                MessageBody: JSON.stringify({
                    type: BrokerageTaskType.NewAccount,
                    userId: req.extra.userId,
                    status: BrokerageTaskStatusType.Pending,
                    data: null,
                    started: null,
                    finished: null,
                    brokerage: DirectBrokeragesType.Robinhood,
                    date: DateTime.now().setZone("America/New_York"),
                    brokerageUserId: username,
                    error: null,
                    messageId: null
                }),
                DelaySeconds: 0,
                QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
            }));

            return {
                status: RobinhoodLoginStatus.SUCCESS,
                body: "Robinhood account successfully updated in TradingPost",
                challengeType: null,
                challengeResponseId: ''
            };
        } catch (e) {
            console.error(e)
            return {
                status: RobinhoodLoginStatus.ERROR,
                body: e instanceof Error ? e.toString() : "Something went wrong trying to add your Robinhood account to TradingPost.",
                challengeResponseId: '',
                challengeType: null,
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
        const {pgp, pgClient, sqsClient} = await init;
        const brokerageRepo = new Repository(pgClient, pgp);
        const tpAccounts = await brokerageRepo.getTradingPostBrokerageAccounts(req.extra.userId);
        if (tpAccounts.length <= 0) return {}

        const tpAccount = tpAccounts.find(tp => tp.id === req.body.accountId);
        if (!tpAccount) return {};

        await brokerageRepo.deleteTradingPostBrokerageAccounts([req.body.accountId]);
        await sqsClient.send(new SendMessageCommand({
            MessageBody: JSON.stringify({
                status: BrokerageTaskStatusType.Pending,
                date: DateTime.now(),
                userId: req.extra.userId,
                type: BrokerageTaskType.DeleteAccount,
                started: null,
                finished: null,
                data: {brokerage: req.body.brokerage, accountId: req.body.accountId},
                error: null,
                brokerageUserId: tpAccount.accountNumber,
                brokerage: req.body.brokerage,
                messageId: null
            }),
            DelaySeconds: 0,
            QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
        }));

        if (tpAccounts.length <= 1) return {}

        const portSummary = new PortfolioSummaryService(brokerageRepo);
        await portSummary.computeAccountGroupSummary(req.extra.userId);

        return {};
    },
    createIbkrAccounts: async (req) => {
        const {pgp, pgClient, sqsClient} = await init;
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
                officialName: null,
                authenticationService: "Ibkr"
            }
            return x;
        });

        const newTpAccountIds = await repository.upsertTradingPostBrokerageAccounts(tpAccounts);
        await repository.addTradingPostAccountGroup(req.extra.userId, 'default', newTpAccountIds, 10117);
        for (let i = 0; i < req.body.account_ids.length; i++) {
            const ai = req.body.account_ids[i];
            await sqsClient.send(new SendMessageCommand({
                MessageBody: JSON.stringify({
                    type: BrokerageTaskType.NewAccount,
                    userId: req.extra.userId,
                    status: BrokerageTaskStatusType.Pending,
                    data: null,
                    started: null,
                    finished: null,
                    brokerage: DirectBrokeragesType.Ibkr,
                    date: DateTime.now().setZone("America/New_York"),
                    brokerageUserId: ai,
                    error: null,
                    messageId: null
                }),
                DelaySeconds: 0,
                QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
            }))
        }
        return {}
    }
})
