
import { DateTime } from "luxon";
import {rawTweet, formatedTweet, formatedTwitterUser, twitterParams, PlatformToken} from './interfaces/twitter';
import { IDatabase, IMain } from "pg-promise";

export default class Repository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;
    public defaultStartDateDays: number;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
        this.defaultStartDateDays = 90;
    }
    getTweetsLastUpdate = async (twitterUserId: string): Promise<Date> => {
        let query = `SELECT twitter_user_id, MAX(created_at) 
                     FROM tweets 
                     WHERE twitter_user_id = $1 
                     GROUP BY twitter_user_id`;
        let result = await this.db.any(query, [twitterUserId]);
        if (result.length === 0) {
            let defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() - this.defaultStartDateDays);
            return defaultDate;
        } else {
            return result[0].max
        }
    }

    getTokens = async (userIds: string[], platform: string) => {
        const query = `SELECT id,
                              platform,
                              platform_user_id,
                              access_token,
                              refresh_token,
                              epxiration,
                              claims,
                              user_id,
                              created_at,
                              updated_at
                       FROM data_platform_claim
                       WHERE user_id IN ($1) AND platform = '$2'
                       `;
        const response = await this.db.query(query, [userIds.join(', '), platform]);
        
        return response;
    }

    upsertUserTokens = async (twitterUsers: PlatformToken[]) => {
        // TODO: add query to upsert token into third-party claims table
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'userId', prop: 'user_id'},
            {name: 'platform', prop: 'platform'},
            {name: 'platformUserId', prop: 'platform_user_id'},
            {name: 'accessToken', prop: 'access_token'},
            {name: 'refreshToken', prop: 'refresh_token'},
            {name: 'expiration', prop: 'expires_in'}
        ], {table: 'data_platform_claim'})
        const query = this.pgp.helpers.insert(twitterUsers, cs) + ` ON CONFLICT platform_platform_user_id_key DO UPDATE SET
                                                                    access_token = EXCLUDED.access_token,
                                                                    refresh_token = EXCLUDED.refresh_token,
                                                                    expiration = EXCLUDED.expiration
                                                                    `;
        const result = await this.db.result(query);

        return result;
    }

    upsertTweets = async (formatedTweets: formatedTweet[]) => {

        try {

            const cs = new this.pgp.helpers.ColumnSet([
            {name: 'tweet_id', prop: 'tweet_id'},
            {name: 'twitter_user_id', prop: 'twitter_user_id'},
            {name: 'embed', prop: 'embed'}, 
            {name: 'lang', prop: 'lang'},
            {name: 'like_count', prop: 'like_count'},
            {name: 'quote_count', prop: 'quote_count'},
            {name: 'reply_count', prop: 'reply_count'},
            {name: 'retweet_count', prop: 'retweet_count'},
            {name: 'possibly_sensitive', prop: 'possibly_sensitive'},
            {name: 'text', prop: 'text'},
            {name: 'tweet_url', prop: 'tweet_url'},
            {name: 'urls', prop: 'urls'},
            {name: 'media_keys', prop: 'media_keys'},
            {name: 'annotations', prop: 'annotations'},
            {name: 'cashtags', prop: 'cashtags'},
            {name: 'hashtags', prop: 'hashtags'},
            {name: 'mentions', prop: 'mentions'},
            {name: 'twitter_created_at', prop: 'twitter_created_at'}
            ], {table: 'tweets'})
            const query = this.pgp.helpers.insert(formatedTweets, cs) + ` ON CONFLICT ON CONSTRAINT tweets_tweet_id_key DO UPDATE SET
                                                                            like_count = EXCLUDED.like_count,
                                                                            quote_count = EXCLUDED.quote_count,
                                                                            reply_count = EXCLUDED.reply_count,
                                                                            retweet_count = EXCLUDED.retweet_count
                                                                            `;
            
            const result = await this.db.result(query);
            return result.rowCount;
        } catch (err) {
            //console.log(err);
            return 0;
        }   
    }
    upsertTwitterUser = async (users: formatedTwitterUser[]): Promise<number> => {
        
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'protected', prop: 'protected'},
                {name: 'display_name', prop: 'display_name'},
                {name: 'follower_count', prop: 'follower_count'},
                {name: 'following_count', prop: 'following_count'},
                {name: 'location', prop: 'location'},
                {name: 'twitter_created_at', prop: 'twitter_created_at'},
                {name: 'username', prop: 'username'},
                {name: 'description', prop: 'description'},
                {name: 'profile_image_url', prop: 'profile_image_url'},
                {name: 'profile_url', prop: 'profile_url'},
                {name: 'twitter_user_id', prop: 'twitter_user_id'},
            ], {table: 'twitter_users'})
            const query = this.pgp.helpers.insert(users, cs) + ` ON CONFLICT ON CONSTRAINT twitter_users_twitter_user_id_key DO UPDATE SET
                                                                 display_name = EXCLUDED.display_name,
                                                                 follower_count = EXCLUDED.follower_count,
                                                                 following_count = EXCLUDED.following_count,
                                                                 description = EXCLUDED.description,
                                                                 profile_image_url = EXCLUDED.profile_image_url,
                                                                 profile_url = EXCLUDED.profile_url
                                                                 `;
            const result = await this.db.result(query);
            return result.rowCount
        } catch (err) {
            console.log(err);
            throw err
        }
    }

}
