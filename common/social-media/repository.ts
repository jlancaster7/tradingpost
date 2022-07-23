/*
import { DateTime } from "luxon";
import {rawTweet, formatedTweet, twitterParams} from './interfaces/twitter';
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
    getStartDate = async (twitterUserId: string) => {
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
    appendTweets = async (formatedTweets: formatedTweet[]): Promise<number> => {
        let success = 0;
        try {
            let values: string[];
            let query: string;
            let result;
            let value_index = '';

            for (let i = 0; i < formatedTweets.length; i++) {
                
                values = Object.values(formatedTweets[i]);
                value_index = '';
                values.map((obj, index) => {
                    value_index += `$${index + 1}, `;
                });

                value_index = value_index.substring(0, value_index.length - 2);
                //query = `INSERT INTO tweets(tweet_id, twitter_user_id, embed, lang, like_count, quote_count, reply_count, retweet_count, possibly_sensitive, text, tweet_url, urls, media_keys, annotations, cashtags, hashtags, mentions, twitter_created_at)
                //         VALUES (${value_index})
                //         ON CONFLICT (tweet_id) DO NOTHING`;
                query
                
                result = await this.db.any(query, values);
                success += result.length;
            }
        } catch (err) {
            console.log(err);
        }
        return success;
    }

}
*/