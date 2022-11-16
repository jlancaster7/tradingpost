import {ensureServerExtensions} from ".";
import Brokerage, {RobinhoodLoginResponse, RobinhoodLoginStatus} from "./Brokerage";
import {v4 as uuidv4} from 'uuid';
import fetch from 'node-fetch';

// Robinhood Stuff....
// Have a user login with their account
//  ... once we have authenticated their account
//  ... add them to the brokerage
//  ... pull in their shit
//  ...


export default ensureServerExtensions<Brokerage>({
    robinhoodLogin: async (req): Promise<RobinhoodLoginResponse> => {
        const {username, password, challengeType, mfaCode} = req.body;
        const loginUrl = 'https://api.robinhood.com/oauth2/token/';
        const fauxDeviceToken = uuidv4();
        let payload: Record<string, any> = {
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
                body: JSON.stringify(payload)
            });
            const body = await response.json();
            console.log(body);
            return {
                status: RobinhoodLoginStatus.MFA,
                body: ""
            }
        } catch (e) {
            console.error(e)
            return {
                status: RobinhoodLoginStatus.ERROR,
                body: ""
            }
        }
    },
})