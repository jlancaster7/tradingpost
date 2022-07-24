import { twitterConfig } from '../interfaces/utils';
import { rawTwitterUser, formatedTwitterUser } from '../interfaces/twitter';
import { IDatabase, IMain } from "pg-promise";
export declare class TwitterUsers {
    private twitterConfig;
    private pg_client;
    private pgp;
    private twitterUrl;
    private params;
    constructor(twitterConfig: twitterConfig, pg_client: IDatabase<any>, pgp: IMain);
    upsertUserToken: (twitterUsers: {
        userIds: string;
        tokens: string;
    }[]) => Promise<void>;
    importUserByToken: (twitterUsers: {
        userIds: string;
        tokens: string;
    }[]) => Promise<[formatedTwitterUser[], number]>;
    importUserByHandle: (handles: string | string[]) => Promise<[formatedTwitterUser[], number]>;
    getUserInfo: (handles: string[]) => Promise<rawTwitterUser[]>;
    getUserInfoByToken: (token: string) => Promise<rawTwitterUser | null>;
    formatUserInfo: (rawUsers: rawTwitterUser[]) => formatedTwitterUser[];
    appendUserInfo: (users: formatedTwitterUser[]) => Promise<number>;
}
