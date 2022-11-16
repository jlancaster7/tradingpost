import Extension from "./";

export type RobinhoodLoginRequest = {
    username: string
    password: string
    challengeType: string
    mfaCode: string | null
}

export enum RobinhoodLoginStatus {
    MFA = "MFA",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}

export type RobinhoodLoginResponse = {
    status: RobinhoodLoginStatus
    body: string
}

export default class extends Extension {
    robinhoodLogin = this._makeFetch<RobinhoodLoginRequest, RobinhoodLoginResponse>("robinhoodLogin", this._defaultPostRequest)
}