import { formatedTweet, formatedTwitterUser } from '../interfaces/twitter';
import { IDatabase, IMain } from "pg-promise";
declare type TwitterConfiguration = {
    API_key: string;
    API_secret_key: string;
    bearer_token: string;
};
export declare const lambdaImportTweets: (pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration) => Promise<void>;
export declare const addTwitterUsersByHandle: (handles: string | string[], pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration) => Promise<formatedTwitterUser[]>;
export declare const addTwitterUsersByToken: (twitterUsers: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiration: number;
}, pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration) => Promise<formatedTwitterUser>;
export declare const addTweets: (twitterUserId: string, pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration, startDate?: Date | undefined) => Promise<[formatedTweet[], number]>;
export {};
