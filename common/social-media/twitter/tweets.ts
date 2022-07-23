import fetch from 'node-fetch';
import {rawTweet, formatedTweet, twitterParams} from '../interfaces/twitter';
import {twitterConfig} from '../interfaces/utils';
import {IDatabase, IMain} from "pg-promise";

export class Tweets {
    private twitterConfig: twitterConfig;
    private pg_client: IDatabase<any>;
    private pgp: IMain;
    private twitterUrl: string;
    public startDate: string;
    public defaultStartDateDays: number;
    private params: twitterParams;

    constructor(twitterConfig: twitterConfig, pg_client: IDatabase<any>, pgp: IMain) {
        this.twitterConfig = twitterConfig;
        this.pg_client = pg_client;
        this.pgp = pgp;
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterConfig['bearer_token'] as string
            }
        }
        this.twitterUrl = "https://api.twitter.com/2";
        this.startDate = '';
        this.defaultStartDateDays = 90;
    }

    setStartDate = async (startDate: Date) => {
        this.startDate = startDate.toISOString();
    }

    getStartDate = async (twitter_user_id: string) => {
        const query = 'SELECT twitter_user_id, MAX(created_at) FROM tweets WHERE twitter_user_id = $1 GROUP BY twitter_user_id ';
        const result = await this.pg_client.result(query, [twitter_user_id]);
        if (result.rowCount === 0) {
            let defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() - this.defaultStartDateDays);
            await this.setStartDate(defaultDate);
        } else {
            await this.setStartDate(result.rows[0].max);
        }
    }

    importTweets = async (twitterUserId: string, userToken: string | null = null): Promise<[formatedTweet[], number]> => {
        const data = await this.getUserTweets(twitterUserId, userToken);
        if (data === []) {
            return [[], 0];
        }
        const formatedData = this.formatTweets(data);
        const result = await this.appendTweets(formatedData);
        return [formatedData, result];
    }

    getUserTweets = async (twitterUserId: string, userToken: string | null): Promise<rawTweet[]> => {
        if (this.startDate === '') {
            await this.getStartDate(twitterUserId)
        }
        if (userToken) {
            this.params.headers.authorization = 'BEARER ' + userToken
        } else {
            this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'] as string
        }
        let data = [];
        try {
            const tweetsEndpoints = `/users/${twitterUserId}/tweets?`;

            let nextToken = '';
            let fetchUrl: string;
            let tweetUrl: string;
            let response;
            let responseData;
            
            while (nextToken !== 'end') {
                if (nextToken === '') {
                    fetchUrl = this.twitterUrl + tweetsEndpoints + new URLSearchParams({
                        exclude: "replies",
                        max_results: '5',
                        start_time: this.startDate,
                        "tweet.fields": "id,lang,public_metrics,text,attachments,entities,created_at,possibly_sensitive",
                    });
                } else {
                    fetchUrl = this.twitterUrl + tweetsEndpoints + new URLSearchParams({
                        exclude: "replies",
                        max_results: '5',
                        pagination_token: nextToken,
                        start_time: this.startDate,
                        "tweet.fields": "id,lang,public_metrics,text,attachments,entities,created_at,possibly_sensitive",
                    });
                }

                response = await (await fetch(fetchUrl, this.params)).json();
                responseData = response.data;
                

                if (responseData === undefined) {
                    this.startDate = '';
                    return data;
                }

                for (let i = 0; i < responseData.length; i++) {
                    tweetUrl = `https://twitter.com/${responseData[i].username}/status/${responseData[i].id}`
                    fetchUrl = `https://publish.twitter.com/oembed?url=${tweetUrl}`;
                    let response = await (await fetch(fetchUrl, this.params)).json();

                    responseData[i].tweet_url = tweetUrl;
                    responseData[i].embed = response.html;
                    responseData[i].twitter_user_id = twitterUserId;

                    data.push(responseData[i]);
                }

                if (Object.keys(response.meta).includes('next_token')) {
                    nextToken = response.meta.next_token;
                } else {
                    nextToken = 'end';
                }
            }
        } catch (err) {
            console.log(err);
        }

        this.startDate = '';
        return data;
    }

    formatTweets = (rawTweets: rawTweet[]): formatedTweet[] => {
        
        let formatedTweets:formatedTweet[] = [];
        for (let i = 0; i < rawTweets.length; i++) {

            formatedTweets.push({
                tweet_id: rawTweets[i].id,
                twitter_user_id: rawTweets[i].twitter_user_id,
                embed: rawTweets[i].embed,
                lang: rawTweets[i].lang,
                like_count: rawTweets[i].public_metrics.like_count,
                quote_count: rawTweets[i].public_metrics.quote_count,
                reply_count: rawTweets[i].public_metrics.reply_count,
                retweet_count: rawTweets[i].public_metrics.retweet_count,
                possibly_sensitive: rawTweets[i].possibly_sensitive,
                text: rawTweets[i].text,
                tweet_url: rawTweets[i].tweet_url,
                urls: (rawTweets[i].entities!.urls ? JSON.stringify(rawTweets[i].entities!.urls) : null),
                media_keys: (rawTweets[i].entities!.media_keys ? JSON.stringify(rawTweets[i].entities!.media_keys) : null),
                annotations: (rawTweets[i].entities!.annotations ? JSON.stringify(rawTweets[i].entities!.annotations) : null),
                cashtags: (rawTweets[i].entities!.cashtags ? JSON.stringify(rawTweets[i].entities!.cashtags) : null),
                hashtags: (rawTweets[i].entities!.hashtags ? JSON.stringify(rawTweets[i].entities!.hashtags) : null),
                mentions: (rawTweets[i].entities!.mentions ? JSON.stringify(rawTweets[i].entities!.mentions) : null),
                twitter_created_at: rawTweets[i].created_at
            })
            
        }
        return formatedTweets;
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
                query = `INSERT INTO tweets(tweet_id, twitter_user_id, embed, lang, like_count, quote_count, reply_count, retweet_count, possibly_sensitive, text, tweet_url, urls, media_keys, annotations, cashtags, hashtags, mentions, twitter_created_at)
                         VALUES (${value_index})
                         ON CONFLICT (tweet_id) DO UPDATE SET like_count = EXCLUDED.like_count
                                                              quote_count = EXCLUDED.quote_count
                                                              reply_count = EXCLUDED.reply_count
                                                              retweet_count = EXCLUDED.retweet_count
                                                              `;
                result = await this.pg_client.result(query, values);
                success += result.rowCount;
            }
        } catch (err) {
            console.log(err);
        }
        return success;
    }
}


