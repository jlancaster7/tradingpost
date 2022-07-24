import { rawTweet, formatedTweet } from '../interfaces/twitter';
import { twitterConfig } from '../interfaces/utils';
import { IDatabase, IMain } from "pg-promise";
export declare class Tweets {
    private twitterConfig;
    private pg_client;
    private pgp;
    private twitterUrl;
    startDate: string;
    defaultStartDateDays: number;
    private params;
    constructor(twitterConfig: twitterConfig, pg_client: IDatabase<any>, pgp: IMain);
    setStartDate: (startDate: Date) => Promise<void>;
    getStartDate: (twitter_user_id: string) => Promise<void>;
    importTweets: (twitterUserId: string, userToken?: string | null) => Promise<[formatedTweet[], number]>;
    getUserTweets: (twitterUserId: string, userToken: string | null) => Promise<rawTweet[]>;
    formatTweets: (rawTweets: rawTweet[]) => formatedTweet[];
    appendTweets: (formatedTweets: formatedTweet[]) => Promise<number>;
}
