import { ICommentBasic, IUserList, IWatchlistList } from "../interfaces";
import { Extension } from "./index";
import { AccountGroupHPRsTable, TradingPostAccountGroupStats } from '../../../brokerage/interfaces';
export type UploadProfilePicBody = {
    image: string;
};
export default class User extends Extension {
    uploadProfilePic: (settings: UploadProfilePicBody) => Promise<{}>;
    generateBrokerageLink: (settings?: undefined) => Promise<{
        link: string;
    }>;
    getBrokerageAccounts: (settings?: undefined) => Promise<{
        id: number;
        broker_name: string;
        account_number: string;
        user_id: string;
        hidden_for_deletion: boolean;
    }[]>;
    initBrokerageAccounts: (settings?: undefined) => Promise<{}[]>;
    linkSocialAccount: (settings: {
        callbackUrl: string;
        platform: string;
        code?: string | undefined;
        challenge?: string | undefined;
        platform_idenifier?: string | undefined;
    }) => Promise<string>;
    getComments: (settings: {
        userId?: string | undefined;
    }) => Promise<ICommentBasic[]>;
    getTrades: (req: {
        $page: number;
        $limit?: number | undefined;
        settings: {
            userId?: string | undefined;
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
    getHoldings: (settings: {
        userId?: string | undefined;
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
    getWatchlists: (settings: {
        userId: string;
    }) => Promise<IWatchlistList[]>;
    getReturns: (settings: {
        userId?: string | undefined;
        startDate: Date;
        endDate: Date;
    }) => Promise<AccountGroupHPRsTable[]>;
    getPortfolio: (settings: {
        userId?: string | undefined;
    }) => Promise<TradingPostAccountGroupStats>;
    search: (settings: {
        term: string;
    }) => Promise<IUserList[]>;
    validateUser: (settings: {
        verificationToken: string;
    }) => Promise<{}>;
    sendEmailValidation: (settings?: undefined) => Promise<{}>;
    setBlocked: (settings: {
        userId: string;
        block: boolean;
    }) => Promise<{
        userId: string;
    }>;
    getBlocked: (settings?: undefined) => Promise<IUserList[]>;
    testNotifcation: (settings?: undefined) => Promise<{}>;
    getPortfolioNotifications: (settings: {
        typeId: number;
    }) => Promise<{
        is_notification: boolean;
    }>;
    togglePortfolioNotifications: (settings: {
        typeId: number;
        is_notification: boolean;
    }) => Promise<{}>;
    discoveryOne: (settings: {
        page: number;
        limit: number;
    }) => Promise<(IUserList & {
        title: string;
        description: string;
    })[]>;
    discoveryTwo: (settings: {
        page: number;
        limit: number;
    }) => Promise<(IUserList & {
        title: string;
        description: string;
    })[]>;
    discoveryThree: (settings: {
        page: number;
        limit: number;
    }) => Promise<IUserList[]>;
}
