import { RobinhoodChallengeStatus, RobinhoodLoginResponse } from "./Brokerage";
import { DirectBrokeragesType } from "../../../brokerage/interfaces";
declare const _default: {
    robinhoodLogin: (req: {
        body: import("./Brokerage").RobinhoodLoginRequest;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<RobinhoodLoginResponse>;
    hoodPing: (req: {
        body: {
            requestId: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        challengeStatus: RobinhoodChallengeStatus;
    }>;
    scheduleForDeletion: (req: {
        body: {
            brokerage: DirectBrokeragesType;
            accountId: number;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
    createIbkrAccounts: (req: {
        body: {
            account_ids: string[];
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
