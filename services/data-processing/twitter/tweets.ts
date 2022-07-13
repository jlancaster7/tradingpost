import fetch from 'node-fetch';
import {rawTweet, formatedTweet, twitterParams} from '../interfaces/twitter';
import {twitterConfig} from '../interfaces/utils';
import {IDatabaseClient} from "../interfaces";


export class Tweets {
    private twitterConfig: twitterConfig;
    private pg_client: IDatabaseClient;
    private twitterUrl: string;
    public startDate: string;
    public defaultStartDateDays: number;
    private params: twitterParams;

    constructor(twitterConfig: twitterConfig, pg_client: IDatabaseClient) {
        this.twitterConfig = twitterConfig;
        this.pg_client = pg_client;
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

        let query = 'SELECT twitter_user_id, MAX(created_at) FROM tweets WHERE twitter_user_id = $1 GROUP BY twitter_user_id ';
        let result = (await this.pg_client.query(query, [twitter_user_id]));
        if (result.rowCount === 0) {
            let defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() - this.defaultStartDateDays);
            this.setStartDate(defaultDate);
        } else {
            this.setStartDate(result.rows[0].max);
        }

    }

    importTweets = async (twitterUserId: string): Promise<[formatedTweet[], number]> => {

        const data = await this.getUserTweets(twitterUserId);
        if (data === []) {
            return [[], 0];
        }
        const formatedData = this.formatTweets(data);
        const result = await this.appendTweets(formatedData);
        return [formatedData, result];
    }

    getUserTweets = async (twitterUserId: string): Promise<rawTweet[]> => {

        if (this.startDate === '') {
            await this.getStartDate(twitterUserId)
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
                ;

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

        let keys;
        let formatedTweets: any[] = JSON.parse(JSON.stringify(rawTweets));

        for (let i = 0; i < rawTweets.length; i++) {

            formatedTweets[i].tweet_id = rawTweets[i].id;
            delete formatedTweets[i].id;

            formatedTweets[i].retweet_count = rawTweets[i].public_metrics.retweet_count;
            formatedTweets[i].reply_count = rawTweets[i].public_metrics.reply_count;
            formatedTweets[i].like_count = rawTweets[i].public_metrics.like_count;
            formatedTweets[i].quote_count = rawTweets[i].public_metrics.quote_count;
            formatedTweets[i].twitter_created_at = rawTweets[i].created_at;

            delete formatedTweets[i].created_at;
            delete formatedTweets[i].public_metrics;


            if (Object.keys(rawTweets[i]).includes('attachments')) {
                formatedTweets[i].media_keys = JSON.stringify({data: rawTweets[i].attachments!.media_keys});

                delete formatedTweets[i].attachments;
            }

            if (Object.keys(rawTweets[i]).includes('entities')) {

                keys = Object.keys(rawTweets[i].entities!);

                if (keys.includes('urls')) {
                    formatedTweets[i].urls = JSON.stringify(rawTweets[i].entities!.urls);
                }
                if (keys.includes('annotations')) {
                    formatedTweets[i].annotations = JSON.stringify(rawTweets[i].entities!.annotations);
                }
                if (keys.includes('cashtags')) {
                    formatedTweets[i].cashtags = JSON.stringify(rawTweets[i].entities!.cashtags);
                }
                if (keys.includes('mentions')) {
                    formatedTweets[i].mentions = JSON.stringify(rawTweets[i].entities!.mentions);
                }
                if (keys.includes('hashtags')) {
                    formatedTweets[i].hashtags = JSON.stringify(rawTweets[i].entities!.hashtags);
                }

                delete formatedTweets[i].entities;
            }
        }

        return formatedTweets;
    }

    appendTweets = async (formatedTweets: formatedTweet[]): Promise<number> => {

        let success = 0;
        try {

            let keys: string;
            let values: string[];
            let query: string;
            let result;
            let value_index = '';

            for (let i = 0; i < formatedTweets.length; i++) {

                keys = Object.keys(formatedTweets[i]).join(' ,');
                values = Object.values(formatedTweets[i]);

                value_index = '';
                values.map((obj, index) => {
                    value_index += `$${index + 1}, `;
                });
                value_index = value_index.substring(0, value_index.length - 2);

                query = `INSERT INTO tweets(${keys})
                         VALUES (${value_index})
                         ON CONFLICT (tweet_id) DO NOTHING`;
                result = await this.pg_client.query(query, values);

                success += result.rowCount;
            }

        } catch (err) {
            console.log(err);
        }
        return success;
    }
}


