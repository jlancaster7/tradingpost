import Repository from "../repository";
import {twitterConfig, PlatformToken} from '../utils';
import fetch from "node-fetch";
import {formatedTweet, formatedTwitterUser, rawTweet, rawTwitterUser} from "./interfaces";
import PostPrepper from "../../post-prepper";

export default class Twitter {
    private repository: Repository;
    private twitterCfg: twitterConfig;
    private readonly twitterUrl: string;
    private readonly params: { headers: { authorization: string }; method: string };
    private startDate: string;
    private defaultStartDateDays: number;
    private postPrepper: PostPrepper;

    constructor(twitterCfg: twitterConfig, repository: Repository, postPrepper: PostPrepper) {
        this.twitterCfg = twitterCfg;
        this.repository = repository;
        this.twitterUrl = "https://api.twitter.com/2";
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterCfg.bearer_token as string
            }
        }
        this.startDate = '';
        this.defaultStartDateDays = 90;
        this.postPrepper = postPrepper;
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
                    client_id: this.twitterCfg.client_id
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
                claims: response[0].claims || {handle: ''},
                updatedAt: new Date()
            };

            await this.repository.upsertUserTokens(data);
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    setStartDate = async (twitterUserId: string, startDate: Date | null = null) => {
        if (startDate) {
            this.startDate = startDate.toISOString();
        } else {
            this.startDate = (await this.repository.getTweetsLastUpdate(twitterUserId)).toISOString();
        }
    }

    importTweets = async (twitterUserId: string, userToken: string | null = null): Promise<[formatedTweet[], number]> => {
        const data = await this.getUserTweets(twitterUserId, userToken);
        if (data.length <= 0) {
            return [[], 0];
        }

        const formatedData = await this.formatTweets(data);
        const jobs = [];
        for (let i = 0; i < formatedData.length; i++) {
            jobs.push(this.postPrepper.twitter(formatedData[i].embed));
        }

        const r = await Promise.all(jobs);
        r.forEach((item, idx) => {
            const {maxWidth, aspectRatio} = item;
            formatedData[idx].max_width = maxWidth;
            formatedData[idx].aspect_ratio = aspectRatio;
        });

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
            this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token as string
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
                            this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token as string;
                            response = await (await fetch(fetchUrl, this.params)).json();
                            responseData = response.data;
                            if (!responseData) {
                                this.startDate = '';
                                throw new Error(`Tried auth and api key, both failed for twitter user id: ${twitterUserId}`)
                            }
                        }
                    } else {
                        this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token as string;
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
            if (err instanceof Error) {
                console.warn(err.message);
            }
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

    importUserByToken = async (twitterUser: { userId: string, accessToken: string, refreshToken: string, expiration: number }): Promise<[formatedTwitterUser, number]> => {

        let data: rawTwitterUser | null;
        let token: PlatformToken;

        data = await this.getUserInfoByToken(twitterUser.accessToken);

        if (!data) {
            const newToken = await this.refreshTokensbyId('user_id', twitterUser.userId);
            if (!newToken) {
                throw new Error(`Failed to import user for user id: ${twitterUser.userId}`);
            }
            data = await this.getUserInfoByToken(twitterUser.accessToken);
            if (!data) {
                throw new Error("Twitter API failed");
            }
        }
        const expiration = new Date();
        token = {
            userId: twitterUser.userId,
            platform: 'twitter',
            platformUserId: data.id,
            accessToken: twitterUser.accessToken,
            refreshToken: twitterUser.refreshToken,
            expiration: new Date(expiration.getTime() + twitterUser.expiration),
            claims: {
                handle: data.username
            },
            updatedAt: new Date()
        }

        const formatedData = this.formatUser([data])[0];

        let dummyTokens = (await this.repository.getTokens('platform_user_id', [token.platformUserId], 'twitter'));
        if (dummyTokens.length && twitterUser.userId !== dummyTokens[0].userId) {
            const dummyCheck = await this.repository.isUserIdDummy(dummyTokens[0].userId);
            if (dummyCheck) {
                await this.repository.mergeDummyAccounts({
                    newUserId: twitterUser.userId,
                    dummyUserId: dummyTokens[0].userId
                });
            } else {
                throw new Error("This account is claimed by another non-dummy user.");
            }
        }
        await this.repository.upsertUserTokens(token);
        const result = await this.repository.upsertTwitterUser([formatedData]);
        return [formatedData, result];
    }

    importUserByHandle = async (handles: string | string[]): Promise<formatedTwitterUser[]> => {
        if (typeof handles === 'string') {
            handles = [handles];
        }
        const data = await this.getUserInfo(handles);
        if (data === null || data.length <= 0) {
            return []
        }
        const formatedData = this.formatUser(data);
        const result = await this.repository.upsertTwitterUser(formatedData);

        return formatedData;
    }

    getUserInfo = async (handles: string[]): Promise<rawTwitterUser[]> => {
        let data;
        try {
            this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token as string;
            const userInfoEndpoint = "/users/by?";

            const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                usernames: handles.join(),
                "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username",
            })

            const response = await fetch(fetchUrl, this.params);
            data = (await response.json()).data;
            return data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    getUserInfoByToken = async (token: string): Promise<rawTwitterUser | null> => {
        let data;
        try {
            this.params.headers.authorization = 'BEARER ' + token;

            const userInfoEndpoint = "/users/me?";

            const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username"
            })

            const response = await fetch(fetchUrl, this.params);
            data = (await response.json()).data;
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    formatUser = (rawUsers: rawTwitterUser[]): formatedTwitterUser[] => {

        let formatedUsers: formatedTwitterUser[] = [];
        for (let i = 0; i < rawUsers.length; i++) {
            formatedUsers.push({
                twitter_user_id: rawUsers[i].id,
                username: rawUsers[i].username,
                display_name: rawUsers[i].name,
                description: rawUsers[i].description,
                profile_url: 'https://www.twitter.com/' + rawUsers[i].username,
                profile_image_url: rawUsers[i].profile_image_url,
                location: rawUsers[i].location,
                protected: rawUsers[i].protected,
                twitter_created_at: new Date(rawUsers[i].created_at),
                follower_count: rawUsers[i].public_metrics.followers_count,
                following_count: rawUsers[i].public_metrics.following_count
            })

        }

        return formatedUsers;
    }
}