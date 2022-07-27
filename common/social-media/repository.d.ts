import { formatedTweet, formatedTwitterUser, PlatformToken } from './interfaces/twitter';
import { IDatabase, IMain } from "pg-promise";
export default class Repository {
    private db;
    private readonly pgp;
    defaultStartDateDays: number;
    constructor(db: IDatabase<any>, pgp: IMain);
    getTweetsLastUpdate: (twitterUserId: string) => Promise<Date>;
    getTokens: (userIds: string[], platform: string) => Promise<any>;
    upsertUserTokens: (twitterUsers: PlatformToken[]) => Promise<import("pg-promise").IResultExt>;
    upsertTweets: (formatedTweets: formatedTweet[]) => Promise<number>;
    upsertTwitterUser: (users: formatedTwitterUser[]) => Promise<number>;
}
