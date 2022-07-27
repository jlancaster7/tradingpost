"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tweets = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class Tweets {
    constructor(twitterConfig, repository) {
        this.setStartDate = (twitterUserId, startDate = null) => __awaiter(this, void 0, void 0, function* () {
            if (startDate) {
                this.startDate = startDate.toISOString();
            }
            else {
                this.startDate = (yield this.repository.getTweetsLastUpdate(twitterUserId)).toISOString();
            }
        });
        this.refreshTokensbyId = (userIds) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.repository.getTokens(userIds, 'twitter');
                const authUrl = '/oauth2/token';
                let data = [];
                for (let d of response) {
                    const refreshParams = {
                        method: 'POST',
                        headers: {
                            "content-type": 'application/x-www-form-urlencoded'
                        },
                        form: {
                            refresh_token: d.claims.refresh_token,
                            grant_type: 'refresh_token',
                            client_id: this.twitterConfig.clientId
                        }
                    };
                    const fetchUrl = this.twitterUrl + authUrl;
                    const response = (yield (yield (0, node_fetch_1.default)(fetchUrl, refreshParams)).json()).data;
                    data.push({ userId: d.user_id, platform: d.platform, platformUserId: d.platform_user_id, accessToken: response.access_token, refreshToken: response.refresh_token, expiration: response.expires_in });
                }
                yield this.repository.upsertUserTokens(data);
            }
            catch (err) {
                console.error(err);
            }
        });
        this.importTweets = (twitterUserId, userToken = null) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getUserTweets(twitterUserId, userToken);
            if (data === []) {
                return [[], 0];
            }
            const formatedData = this.formatTweets(data);
            const result = yield this.repository.upsertTweets(formatedData);
            return [formatedData, result];
        });
        this.getUserTweets = (twitterUserId, userAccessToken) => __awaiter(this, void 0, void 0, function* () {
            if (this.startDate === '') {
                yield this.setStartDate(twitterUserId);
            }
            if (userAccessToken) {
                this.params.headers.authorization = 'BEARER ' + userAccessToken;
            }
            else {
                this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'];
            }
            let data = [];
            try {
                const tweetsEndpoints = `/users/${twitterUserId}/tweets?`;
                let nextToken = '';
                let fetchUrl;
                let tweetUrl;
                let response;
                let responseData;
                let username;
                while (nextToken !== 'end') {
                    if (nextToken === '') {
                        fetchUrl = this.twitterUrl + tweetsEndpoints + new URLSearchParams({
                            exclude: "replies",
                            max_results: '5',
                            start_time: this.startDate,
                            "tweet.fields": "id,lang,public_metrics,text,attachments,entities,created_at,possibly_sensitive",
                            "expansions": "author_id",
                        });
                    }
                    else {
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
                    response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                    // TODO: Add a catch to refresh the access token if this fails once and then default to the org bearer token
                    responseData = response.data;
                    if (responseData === undefined) {
                        this.startDate = '';
                        return data;
                    }
                    username = response.includes.users[0].username;
                    for (let i = 0; i < responseData.length; i++) {
                        tweetUrl = `https://twitter.com/${username}/status/${responseData[i].id}`;
                        fetchUrl = `https://publish.twitter.com/oembed?url=${tweetUrl}`;
                        let response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                        responseData[i].tweet_url = tweetUrl;
                        responseData[i].embed = response.html;
                        responseData[i].twitter_user_id = twitterUserId;
                        data.push(responseData[i]);
                    }
                    if (Object.keys(response.meta).includes('next_token')) {
                        nextToken = response.meta.next_token;
                    }
                    else {
                        nextToken = 'end';
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
            this.startDate = '';
            return data;
        });
        this.formatTweets = (rawTweets) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            let formatedTweets = [];
            for (let i = 0; i < rawTweets.length; i++) {
                let urls = null;
                if ((_a = rawTweets[i].entities) === null || _a === void 0 ? void 0 : _a.urls)
                    urls = JSON.stringify((_b = rawTweets[i].entities) === null || _b === void 0 ? void 0 : _b.urls);
                let mediaKeys = null;
                if ((_c = rawTweets[i].entities) === null || _c === void 0 ? void 0 : _c.media_keys)
                    mediaKeys = JSON.stringify((_d = rawTweets[i].entities) === null || _d === void 0 ? void 0 : _d.media_keys);
                let cashtags = null;
                if ((_e = rawTweets[i].entities) === null || _e === void 0 ? void 0 : _e.cashtags)
                    cashtags = JSON.stringify((_f = rawTweets[i].entities) === null || _f === void 0 ? void 0 : _f.cashtags);
                let annotations = null;
                if ((_g = rawTweets[i].entities) === null || _g === void 0 ? void 0 : _g.annotations)
                    annotations = JSON.stringify((_h = rawTweets[i].entities) === null || _h === void 0 ? void 0 : _h.annotations);
                let hashtags = null;
                if ((_j = rawTweets[i].entities) === null || _j === void 0 ? void 0 : _j.hashtags)
                    cashtags = JSON.stringify((_k = rawTweets[i].entities) === null || _k === void 0 ? void 0 : _k.hashtags);
                let mentions = null;
                if ((_l = rawTweets[i].entities) === null || _l === void 0 ? void 0 : _l.mentions)
                    mentions = JSON.stringify((_m = rawTweets[i].entities) === null || _m === void 0 ? void 0 : _m.mentions);
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
                    urls: rawTweets[i].entities ? (rawTweets[i].entities.urls ? JSON.stringify(rawTweets[i].entities.urls) : null) : null,
                    media_keys: rawTweets[i].entities ? (rawTweets[i].entities.media_keys ? JSON.stringify(rawTweets[i].entities.media_keys) : null) : null,
                    annotations: rawTweets[i].entities ? (rawTweets[i].entities.annotations ? JSON.stringify(rawTweets[i].entities.annotations) : null) : null,
                    cashtags: rawTweets[i].entities ? (rawTweets[i].entities.cashtags ? JSON.stringify(rawTweets[i].entities.cashtags) : null) : null,
                    hashtags: rawTweets[i].entities ? (rawTweets[i].entities.hashtags ? JSON.stringify(rawTweets[i].entities.hashtags) : null) : null,
                    mentions: rawTweets[i].entities ? (rawTweets[i].entities.mentions ? JSON.stringify(rawTweets[i].entities.mentions) : null) : null,
                    twitter_created_at: rawTweets[i].created_at
                });
            }
            return formatedTweets;
        };
        this.twitterConfig = twitterConfig;
        this.repository = repository;
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterConfig['bearer_token']
            }
        };
        this.twitterUrl = "https://api.twitter.com/2";
        this.startDate = '';
        this.defaultStartDateDays = 90;
    }
}
exports.Tweets = Tweets;
