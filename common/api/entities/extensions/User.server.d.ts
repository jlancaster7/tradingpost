import { UploadProfilePicBody } from "./User";
import { IUserList } from '../apis/UserApi';
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
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<void>;
    generateBrokerageLink: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        link: string;
    }>;
    getBrokerageAccounts: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
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
            page?: number | undefined;
            limit?: number | undefined;
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
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<string>;
    getTrades: (req: {
        body: {
            user_id?: string | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        date: Date;
        type: string;
        quantity: number;
        price: number;
        fees: number;
        currency: string;
        security_id: number;
    }[]>;
    getHoldings: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        id: number;
        price_as_of: Date;
        quantity: number;
        price: number;
        value: number;
        cost_basis: number;
        security_id: number;
    }[]>;
    getWatchlists: (req: {
        body: {
            userId: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<import("../interfaces").IWatchlistList[]>;
    getPortfolio: (req: {
        body: {
            userId?: string | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<import("../../../brokerage/interfaces").TradingPostAccountGroupStats>;
    search: (req: {
        body: {
            term: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<IUserList[]>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
