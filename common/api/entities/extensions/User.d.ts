import { IUserList, IWatchlistList } from "../interfaces";
import { Extension } from "./index";
import { AccountGroupHPRsTable, TradingPostAccountGroupStats } from '../../../brokerage/interfaces';
export declare type UploadProfilePicBody = {
    userId: string;
    image: string;
};
export default class User extends Extension {
    uploadProfilePic: (settings: UploadProfilePicBody) => Promise<void>;
    generateBrokerageLink: (settings?: undefined) => Promise<{
        link: string;
    }>;
    getBrokerageAccounts: (settings?: undefined) => Promise<{
        id: number;
        broker_name: string;
        account_number: string;
        user_id: string;
    }[]>;
    initBrokerageAccounts: (settings?: undefined) => Promise<{}[]>;
    linkSocialAccount: (settings: {
        platform: string;
        code: string;
        challenge: string;
    }) => Promise<string>;
    getTrades: (req: {
        $page: number;
        $limit?: number | undefined;
        settings: {
            user_id?: string | undefined;
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
    getHoldings: (settings?: undefined) => Promise<{
        id: number;
        price_as_of: Date;
        quantity: number;
        price: number;
        value: number;
        cost_basis: number;
        security_id: number;
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
}
