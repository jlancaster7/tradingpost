import {ensureServerExtensions} from ".";
import Brokerage, {RobinhoodLoginResponse, RobinhoodLoginStatus} from "./Brokerage";
import {v4 as uuidv4} from 'uuid';
import fetch from 'node-fetch';
import {TradingPostBrokerageAccountsTable} from "../../../brokerage/interfaces";
import {init} from "../../../db/index";
import Repository from "../../../brokerage/repository";

const loginUrl = 'https://api.robinhood.com/oauth2/token/';

export default ensureServerExtensions<Brokerage>({
    robinhoodLogin: async (req): Promise<RobinhoodLoginResponse> => {
        const {username, password, mfaCode} = req.body;
        const {pgp, pgClient} = await init;
        const brokerageRepo = new Repository(pgClient, pgp);
        let fauxDeviceToken = uuidv4();

        let tpBrokerageAccount: TradingPostBrokerageAccountsTable | null = null;
        const tpBrokerageAccounts = await brokerageRepo.getTradingPostBrokerageAccountsByBrokerageAndIds(req.extra.userId, "Robinhood", [username]);
        if (tpBrokerageAccounts.length >= 0) tpBrokerageAccount = tpBrokerageAccounts[0];

        if (tpBrokerageAccount && tpBrokerageAccount.status === 'active') return {
            status: RobinhoodLoginStatus.SUCCESS,
            body: "Robinhood account already exists and is active"
        }

        const robinhoodUser = await brokerageRepo.getRobinhoodUser(username);
        if (robinhoodUser) {
            fauxDeviceToken = robinhoodUser.deviceToken;
        }

        let challengeType = "sms";

        let payload: Record<string, any> = {
            "username": username,
            "password": password,
            "client_id": "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
            "expires_in": 86400,
            "grant_type": 'password',
            "scope": "internal",
            "challenge_type": challengeType,
            "device_token": fauxDeviceToken
        };

        if (mfaCode) payload["mfa_code"] = mfaCode;

        try {
            const response = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const body = await response.json();
            console.log("Robinhood Login Body: ", body);
            if ('mfa_required' in body) return {
                status: RobinhoodLoginStatus.MFA,
                body: "MFA required to proceed"
            }

            if ('challenge' in body) {
                if (body['status'] === 'issued') return {
                    status: RobinhoodLoginStatus.MFA,
                    body: "MFA required to proceed"
                }
            }

            if ('detail' in body) return {
                status: RobinhoodLoginStatus.ERROR,
                body: body['detail']
            };

            if (!robinhoodUser) {
                await brokerageRepo.insertRobinhoodUser({
                    username: username,
                    deviceToken: fauxDeviceToken,
                    usesMfa: mfaCode !== null,
                    status: RobinhoodLoginStatus.SUCCESS,
                    accessToken: body.access_token,
                    refreshToken: body.refresh_token,
                    userId: req.extra.userId
                })
                await brokerageRepo.addTradingPostBrokerageAccounts([{
                    status: "active",
                    userId: req.extra.userId,
                    accountNumber: username,
                    type: "brokerage",
                    brokerName: "Robinhood",
                    institutionId: 9858,
                    error: false,
                    errorCode: 0,
                    mask: "",
                    name: "",
                    subtype: "",
                    officialName: "",
                }]);

                return {
                    status: RobinhoodLoginStatus.SUCCESS,
                    body: "Robinhood account successfully added to TradingPost."
                }
            }
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
})
