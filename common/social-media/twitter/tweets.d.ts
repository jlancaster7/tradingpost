import { rawTweet, formatedTweet } from '../interfaces/twitter';
import Repository from '../repository';
import { twitterConfig, PlatformToken } from '../interfaces/utils';
export declare class Tweets {
    private twitterConfig;
    private twitterUrl;
    startDate: string;
    defaultStartDateDays: number;
    private params;
    private repository;
    constructor(twitterConfig: twitterConfig, repository: Repository);
    setStartDate: (twitterUserId: string, startDate?: Date | null) => Promise<void>;
    refreshTokensbyId: (idType: string, ids: string[]) => Promise<PlatformToken[]>;
    importTweets: (twitterUserId: string, userToken?: string | null) => Promise<[formatedTweet[], number]>;
    getUserTweets: (twitterUserId: string, token?: string | null) => Promise<rawTweet[]>;
    formatTweets: (rawTweets: rawTweet[]) => formatedTweet[];
}
