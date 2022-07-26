import { rawTweet, formatedTweet } from '../interfaces/twitter';
import Repository from '../repository';
import { twitterConfig } from '../interfaces/utils';
export declare class Tweets {
    private twitterConfig;
    private twitterUrl;
    startDate: string;
    defaultStartDateDays: number;
    private params;
    private repository;
    constructor(twitterConfig: twitterConfig, repository: Repository);
    setStartDate: (twitterUserId: string, startDate?: Date | null) => Promise<void>;
    refreshTokensbyId: (userIds: string[]) => Promise<void>;
    importTweets: (twitterUserId: string, userToken?: string | null) => Promise<[formatedTweet[], number]>;
    getUserTweets: (twitterUserId: string, userAccessToken: string | null) => Promise<rawTweet[]>;
    formatTweets: (rawTweets: rawTweet[]) => formatedTweet[];
}
