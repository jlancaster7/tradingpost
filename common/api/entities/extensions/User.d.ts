import { IWatchlistList } from "../interfaces";
import { Extension } from "./index";
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
    getTrades: (settings?: undefined) => Promise<{
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
}
