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
    scheduleForDeletion = this._makeFetch<{ brokerage: DirectBrokeragesType, accountIds: number[] }, {}>("scheduleForDeletion", this._defaultPostRequest)
}