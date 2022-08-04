import { UploadProfilePicBody } from "./User";
export interface ITokenResponse {
    "token_type": "bearer";
    "expires_in": number;
    "access_token": string;
    "scope": string;
    "refresh_token": string;
}
declare const _default: {
    uploadProfilePic: (req: {
        body: UploadProfilePicBody;
        extra: {
            userId: string;
        };
    }) => Promise<void>;
    generateBrokerageLink: (req: {
        body: undefined;
        extra: {
            userId: string;
        };
    }) => Promise<{
        link: string;
    }>;
    getBrokerageAccounts: (req: {
        body: undefined;
        extra: {
            userId: string;
        };
    }) => Promise<{
        id: number;
        broker_name: string;
        account_number: string;
        user_id: string;
    }[]>;
    initBrokerageAccounts: (req: {
        body: undefined;
        extra: {
            userId: string;
        };
    }) => Promise<{}[]>;
    linkSocialAccount: (req: {
        body: {
            platform: string;
            code: string;
            challenge: string;
        };
        extra: {
            userId: string;
        };
    }) => Promise<string>;
};
export default _default;
