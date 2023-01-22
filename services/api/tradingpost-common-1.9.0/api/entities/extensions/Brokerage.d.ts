import Extension from "./";
import { DirectBrokeragesType } from "../../../brokerage/interfaces";
export type RobinhoodLoginRequest = {
    username: string;
    password: string;
    mfaCode: string | null;
    challengeResponseId: string | null;
};
export declare enum RobinhoodLoginStatus {
    DEVICE_APPROVAL = "DEVICE_APPROVAL",
    MFA = "MFA",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}
export type RobinhoodLoginResponse = {
    status: RobinhoodLoginStatus;
    body: string;
    challengeResponseId?: string;
};
export declare enum RobinhoodChallengeStatus {
    Issued = "issued",
    Redeemed = "redeemed",
    Validated = "validated",
    Unknown = "unknown"
}
export default class extends Extension {
    robinhoodLogin: (settings: RobinhoodLoginRequest) => Promise<RobinhoodLoginResponse>;
    hoodPing: (settings: {
        requestId: string;
    }) => Promise<{
        challengeStatus: RobinhoodChallengeStatus;
    }>;
    scheduleForDeletion: (settings: {
        brokerage: DirectBrokeragesType;
        accountId: number;
    }) => Promise<{}>;
    createIbkrAccounts: (settings: {
        account_ids: string[];
    }) => Promise<{}>;
}
