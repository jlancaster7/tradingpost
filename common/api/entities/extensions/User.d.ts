import { Extension } from "./index";
export declare type UploadProfilePicBody = {
    userId: string;
    image: string;
};
export default class User extends Extension {
    uploadProfilePic: (settings: UploadProfilePicBody) => Promise<any>;
    generateBrokerageLink: (settings: undefined) => Promise<{
        link: string;
    }>;
}
