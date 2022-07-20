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
    importUser: (handles: string | string[]) => Promise<[formatedTwitterUser[], number]>;
    getUserInfo: (handles: string[]) => Promise<rawTwitterUser[]>;
    formatUserInfo: (rawUsers: rawTwitterUser[]) => formatedTwitterUser[];
    appendUserInfo: (users: formatedTwitterUser[]) => Promise<number>;
}
