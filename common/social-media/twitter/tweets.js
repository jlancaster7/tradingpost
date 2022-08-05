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
        this.refreshTokensbyId = (idType, id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.repository.getTokens(idType, [id], 'twitter');
                const authUrl = '/oauth2/token';
                let data;
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
                };
                const fetchUrl = this.twitterUrl + authUrl;
                const result = yield (yield (0, node_fetch_1.default)(fetchUrl, refreshParams)).json();
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
                yield this.repository.upsertUserTokens(data);
                return data;
            }
            catch (err) {
                console.error(err);
                return null;
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
        this.getUserTweets = (twitterUserId, token = null) => __awaiter(this, void 0, void 0, function* () {
            if (this.startDate === '') {
                yield this.setStartDate(twitterUserId);
            }
            if (token) {
                this.params.headers.authorization = 'BEARER ' + token;
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
                            "user.fields": "username"
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
                    if (response.meta && !response.meta.result_count) {
                        this.startDate = '';
                        return [];
                    }
                    responseData = response.data;
                    if (token && !responseData) {
                        const newToken = yield this.refreshTokensbyId('platform_user_id', twitterUserId);
                        if (newToken) {
                            this.params.headers.authorization = 'BEARER ' + newToken.accessToken;
                            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                            responseData = response.data;
                            if (!responseData) {
                                this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'];
                                response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                                responseData = response.data;
                                if (!responseData) {
                                    this.startDate = '';
                                    throw new Error(`Tried auth and api key, both failed for twitter user id: ${twitterUserId}`);
                                }
                            }
                        }
                        else {
                            this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'];
                            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                            responseData = response.data;
                            if (!responseData) {
                                this.startDate = '';
                                throw new Error(`Tried auth and api key, both failed for twitter user id: ${twitterUserId}`);
                            }
                        }
                    }
                    if (!responseData) {
                        this.startDate = '';
                        throw new Error(`Tried api key, failed for twitter user id: ${twitterUserId}`);
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
                this.startDate = '';
                console.log(err);
                return [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdlZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdlZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDREQUErQjtBQUsvQixNQUFhLE1BQU07SUFRZixZQUFZLGFBQTRCLEVBQUUsVUFBc0I7UUFjaEUsaUJBQVksR0FBRyxDQUFPLGFBQXFCLEVBQUUsWUFBeUIsSUFBSSxFQUFFLEVBQUU7WUFDMUUsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzdGO1FBRUwsQ0FBQyxDQUFBLENBQUE7UUFDRCxzQkFBaUIsR0FBRyxDQUFPLE1BQWMsRUFBRSxFQUFVLEVBQWlDLEVBQUU7WUFDcEYsSUFBSTtnQkFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMxRSxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7Z0JBQ2hDLElBQUksSUFBbUIsQ0FBQztnQkFFeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7b0JBRWxCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztpQkFDckQ7Z0JBQ0QsTUFBTSxhQUFhLEdBQUc7b0JBQ2xCLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRTt3QkFDTCxjQUFjLEVBQUUsa0JBQWtCO3FCQUNyQztvQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDakIsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FB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
