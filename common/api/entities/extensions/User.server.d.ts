import { IUserList } from '../apis/UserApi';
import { TradingPostAccountGroupStats } from "../../../brokerage/interfaces";
import { ICommentBasic } from "../interfaces";
export interface ITokenResponse {
    "token_type": "bearer";
    "expires_in": number;
    "access_token": string;
    "scope": string;
    "refresh_token": string;
}
declare const _default: {
    uploadProfilePic: (req: {
        body: import("./User").UploadProfilePicBody;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
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
        hidden_for_deletion: boolean;
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
            callbackUrl: string;
            platform: string;
            code?: string | undefined;
            challenge?: string | undefined;
            platform_idenifier?: string | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<string>;
    getComments: (req: {
        body: {
            userId?: string | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<ICommentBasic[]>;
    getTrades: (req: {
        body: {
            userId?: string | undefined;
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
        option_id: number;
        option_info: any;
    }[]>;
    getHoldings: (req: {
        body: {
            userId?: string | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        security_id: number;
        option_id: number;
        option_info: any;
        price: number;
        quantity: number;
        value: number;
        cost_basis: number;
        pnl: number;
        date: Date;
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
    getReturns: (req: {
        body: {
            userId?: string | undefined;
            startDate: Date;
            endDate: Date;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<import("../../../brokerage/interfaces").AccountGroupHPRsTable[]>;
    getPortfolio: (req: {
        body: {
            userId?: string | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<TradingPostAccountGroupStats>;
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
    validateUser: (req: {
        body: {
            verificationToken: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
    sendEmailValidation: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
    setBlocked: (req: {
        body: {
            userId: string;
            block: boolean;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        userId: string;
    }>;
    getBlocked: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<IUserList[]>;
    testNotifcation: (req: {
        body: undefined;
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
