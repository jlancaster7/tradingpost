import Repository from "../repository";
import { twitterConfig, PlatformToken } from '../utils';
import { formatedTweet, formatedTwitterUser, rawTweet, rawTwitterUser } from "./interfaces";
import PostPrepper from "../../post-prepper";
export default class Twitter {
    private repository;
    private twitterCfg;
    private readonly twitterUrl;
    private readonly params;
    private startDate;
    private defaultStartDateDays;
    private postPrepper;
    constructor(twitterCfg: twitterConfig, repository: Repository, postPrepper: PostPrepper);
    refreshTokensbyId: (idType: string, id: string) => Promise<PlatformToken | null>;
    setStartDate: (twitterUserId: string, startDate?: Date | null) => Promise<void>;
    importTweets: (twitterUserId: string, userToken?: string | null) => Promise<[formatedTweet[], number]>;
    getUserTweets: (twitterUserId: string, token?: string | null) => Promise<rawTweet[]>;
    formatTweets: (rawTweets: rawTweet[]) => Promise<formatedTweet[]>;
    importUserByToken: (twitterUser: {
        userId: string;
        accessToken: string;
        refreshToken: string;
        expiration: number;
    }) => Promise<[formatedTwitterUser, number]>;
    importUserByHandle: (handles: string | string[]) => Promise<formatedTwitterUser[]>;
    getUserInfo: (handles: string[]) => Promise<rawTwitterUser[]>;
    getUserInfoByToken: (token: string) => Promise<rawTwitterUser | null>;
    formatUser: (rawUsers: rawTwitterUser[]) => formatedTwitterUser[];
}
