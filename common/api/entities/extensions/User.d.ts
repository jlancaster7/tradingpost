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
}
