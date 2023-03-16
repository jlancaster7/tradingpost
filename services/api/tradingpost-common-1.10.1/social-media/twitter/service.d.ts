import { formatedTweet, formatedTwitterUser, TweetsAndUsers, TweetsAndUsersTable } from './interfaces';
import Repository from '../repository';
import { IDatabase, IMain } from "pg-promise";
import PostPrepper from "../../post-prepper";
import Twitter from "./";
import ElasticService from "../../elastic";
import { SearchBody } from "../../models/elastic/search";
type TwitterConfiguration = {
    API_key: string;
    API_secret_key: string;
    bearer_token: string;
};
export default class TwitterService {
    private twitter;
    private repository;
    private postPrepper;
    private readonly elasticSrv?;
    constructor(twitter: Twitter, repository: Repository, postPrepper: PostPrepper, elasticSrv?: ElasticService);
    importTweets: () => Promise<void>;
    exportTweetsAndUsers: (lastId: number) => Promise<TweetsAndUsersTable[]>;
    map: (items: TweetsAndUsers[]) => SearchBody[];
    addTwitterUsersByHandle: (handles: string | string[]) => Promise<formatedTwitterUser[]>;
    addTwitterUsersByToken: (twitterUsers: {
        userId: string;
        accessToken: string;
        refreshToken: string;
        expiration: number;
    }) => Promise<formatedTwitterUser>;
    addTweets: (twitterUserId: string, startDate?: Date) => Promise<[formatedTweet[], number]>;
}
export declare const DefaultTwitter: (twitterCfg: TwitterConfiguration, pgClient: IDatabase<any>, pgp: IMain, postPrepper?: PostPrepper, elasticSrv?: ElasticService) => TwitterService;
export {};
