import fetch from 'node-fetch';
import {rawTweet, formatedTweet, twitterParams} from '../interfaces/twitter';
import Repository from '../repository'
import {twitterConfig, PlatformToken} from '../interfaces/utils';
import PostPrepper from "../../post-prepper";

export class Tweets {
    private twitterConfig: twitterConfig;
    private twitterUrl: string;
    public startDate: string;
    public defaultStartDateDays: number;
    private params: twitterParams;
    private repository: Repository;

    constructor(twitterConfig: twitterConfig, repository: Repository) {
        this.twitterConfig = twitterConfig;
        this.repository = repository;
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

    setStartDate = async (twitterUserId: string, startDate: Date | null = null) => {
        if (startDate) {
            this.startDate = startDate.toISOString();
        } else {
            this.startDate = (await this.repository.getTweetsLastUpdate(twitterUserId)).toISOString();
        }

    }
    refreshTokensbyId = async (idType: string, id: string): Promise<PlatformToken | null> => {
        try {
            const response = await this.repository.getTokens(idType, [id], 'twitter');
            const authUrl = '/oauth2/token';
            let data: PlatformToken;

            if (!response.length) {

                throw new Error("No token was found for this ID");
            }
            const refreshParams = {
                method: 'POST',
                headers: {
                    "content-type": 'application/json'
                },
                body: JSON.stringify({
                    refresh_token: response[0].refreshToken,
                    grant_type: 'refresh_token',
                    client_id: this.twitterConfig.client_id
                })
            }

            const fetchUrl = this.twitterUrl + authUrl;
            const result = await (await fetch(fetchUrl, refreshParams)).json();

            const expiration = new Date();
            data = {
                userId: response[0].userId,
                platform: response[0].platform,
                platformUserId: response[0].platformUserId,
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                expiration: new Date(expiration.getTime() + result.expires_in),
                updatedAt: new Date()
            };

            await this.repository.upsertUserTokens(data);
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    importTweets = async (twitterUserId: string, userToken: string | null = null): Promise<[formatedTweet[], number]> => {
        const postPrepper = new PostPrepper();
        await postPrepper.init()
        const data = await this.getUserTweets(twitterUserId, userToken);
        if (data === []) {
            return [[], 0];
        }

        const formatedData = await this.formatTweets(data);
        for (let i = 0; i < formatedData.length; i++) {
            const {maxWidth, aspectRatio} = await postPrepper.twitter(formatedData[i].embed);
            formatedData[i].max_width = maxWidth;
            formatedData[i].aspect_ratio = aspectRatio;
        }

        const result = await this.repository.upsertTweets(formatedData);
        return [formatedData, result];
    }

    getUserTweets = async (twitterUserId: string, token: string | null = null): Promise<rawTweet[]> => {
        if (this.startDate === '') {
            await this.setStartDate(twitterUserId)
        }
        if (token) {
            this.params.headers.authorization = 'BEARER ' + token;
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
            let username: string;

            while (nextToken !== 'end') {
                if (nextToken === '') {
                    fetchUrl = this.twitterUrl + tweetsEndpoints + new URLSearchParams({
                        exclude: "replies",
                        max_results: '5',
                        start_time: this.startDate,
                        "tweet.fields": "id,lang,public_metrics,text,attachments,entities,created_at,possibly_sensitive",
                        "expansions": "author_id",
                        "user.fields": "username"
                    });
                } else {
                    fetchUrl = this.twitterUrl + tweetsEndpoints + new URLSearchParams({
                        exclude: "replies",
                        max_results: '5',
                        pagination_token: nextToken,
                        start_time: this.startDate,
                        "tweet.fields": "id,lang,public_metrics,text,attachments,entities,created_at,possibly_sensitive",
                        "expansions": "author_id",
                        "user.fields": "username"
                    });
                }

                response = await (await fetch(fetchUrl, this.params)).json();

                if (response.meta && !response.meta.result_count) {
                    this.startDate = '';
                    return [];
                }
                responseData = response.data;

                if (token && !responseData) {
                    const newToken = await this.refreshTokensbyId('platform_user_id', twitterUserId);
                    if (newToken) {
                        this.params.headers.authorization = 'BEARER ' + newToken!.accessToken;
                        response = await (await fetch(fetchUrl, this.params)).json();
                        responseData = response.data;
                        if (!responseData) {
                            this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'] as string;
                            response = await (await fetch(fetchUrl, this.params)).json();
                            responseData = response.data;
                            if (!responseData) {
                                this.startDate = '';
                                throw new Error(`Tried auth and api key, both failed for twitter user id: ${twitterUserId}`)
                            }
                        }
                    } else {
                        this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'] as string;
                        response = await (await fetch(fetchUrl, this.params)).json();
                        responseData = response.data;
                        if (!responseData) {
                            this.startDate = '';
                            throw new Error(`Tried auth and api key, both failed for twitter user id: ${twitterUserId}`)
                        }
                    }
                }
                if (!responseData) {
                    this.startDate = '';
                    throw new Error(`Tried api key, failed for twitter user id: ${twitterUserId}`)
                }

                username = response.includes.users[0].username;

                for (let i = 0; i < responseData.length; i++) {
                    tweetUrl = `https://twitter.com/${username}/status/${responseData[i].id}`
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
            this.startDate = '';
            console.log(err);
            return [];
        }
        this.startDate = '';
        return data;
    }

    formatTweets = async (rawTweets: rawTweet[]): Promise<formatedTweet[]> => {
        let formatedTweets: formatedTweet[] = [];
        for (let i = 0; i < rawTweets.length; i++) {
            let urls = null;
            if (rawTweets[i].entities?.urls) urls = JSON.stringify(rawTweets[i].entities?.urls)

            let mediaKeys = null;
            if (rawTweets[i].entities?.media_keys) mediaKeys = JSON.stringify(rawTweets[i].entities?.media_keys)

            let cashtags = null;
            if (rawTweets[i].entities?.cashtags) cashtags = JSON.stringify(rawTweets[i].entities?.cashtags)

            let annotations = null;
            if (rawTweets[i].entities?.annotations) annotations = JSON.stringify(rawTweets[i].entities?.annotations)

            let hashtags = null;
            if (rawTweets[i].entities?.hashtags) cashtags = JSON.stringify(rawTweets[i].entities?.hashtags)

            let mentions = null;
            if (rawTweets[i].entities?.mentions) mentions = JSON.stringify(rawTweets[i].entities?.mentions)

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
                urls: rawTweets[i].entities ? (rawTweets[i].entities!.urls ? JSON.stringify(rawTweets[i].entities!.urls) : null) : null,
                media_keys: rawTweets[i].entities ? (rawTweets[i].entities!.media_keys ? JSON.stringify(rawTweets[i].entities!.media_keys) : null) : null,
                annotations: rawTweets[i].entities ? (rawTweets[i].entities!.annotations ? JSON.stringify(rawTweets[i].entities!.annotations) : null) : null,
                cashtags: rawTweets[i].entities ? (rawTweets[i].entities!.cashtags ? JSON.stringify(rawTweets[i].entities!.cashtags) : null) : null,
                hashtags: rawTweets[i].entities ? (rawTweets[i].entities!.hashtags ? JSON.stringify(rawTweets[i].entities!.hashtags) : null) : null,
                mentions: rawTweets[i].entities ? (rawTweets[i].entities!.mentions ? JSON.stringify(rawTweets[i].entities!.mentions) : null) : null,
                twitter_created_at: rawTweets[i].created_at,
                aspect_ratio: 0,
                max_width: 0
            })
        }
        return formatedTweets;
    }

}


