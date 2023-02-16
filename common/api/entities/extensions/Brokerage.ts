import Extension from "./";
import {DirectBrokeragesType} from "../../../brokerage/interfaces";

export type RobinhoodLoginRequest = {
    username: string
    password: string
    mfaCode: string | null
    challengeResponseId: string | null
}

export enum RobinhoodLoginStatus {
    DEVICE_APPROVAL = "DEVICE_APPROVAL",
    MFA = "MFA",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}

export type RobinhoodLoginResponse = {
    status: RobinhoodLoginStatus
    body: string
    challengeResponseId?: string
    challengeType: string | null
}

export enum RobinhoodChallengeStatus {
    Issued = "issued",
    Redeemed = "redeemed",
    Validated = "validated",
    Unknown = "unknown"
}

export default class extends Extension {
    robinhoodLogin = this._makeFetch<RobinhoodLoginRequest, RobinhoodLoginResponse>("robinhoodLogin", this._defaultPostRequest)
    hoodPing = this._makeFetch<{ requestId: string }, { challengeStatus: RobinhoodChallengeStatus }>("hoodPing", this._defaultPostRequest)
    scheduleForDeletion = this._makeFetch<{ brokerage: DirectBrokeragesType, accountId: number }, {}>("scheduleForDeletion", this._defaultPostRequest)
    createIbkrAccounts = this._makeFetch<{ account_ids: string[] }, {}>("createIbkrAccounts", this._defaultPostRequest)
}