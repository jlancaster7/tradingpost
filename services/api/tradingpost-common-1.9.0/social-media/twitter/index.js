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
const node_fetch_1 = __importDefault(require("node-fetch"));
class Twitter {
    constructor(twitterCfg, repository, postPrepper) {
        this.refreshTokensbyId = (idType, id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const twitterTokens = yield this.repository.getTokens(idType, [id], 'twitter');
                const authUrl = '/oauth2/token';
                let data;
                if (twitterTokens.length <= 0) {
                    console.error(`no token was found for twitter user id ${id}`);
                    return null;
                }
                const refreshParams = {
                    method: 'POST',
                    headers: {
                        "content-type": 'application/json'
                    },
                    body: JSON.stringify({
                        refresh_token: twitterTokens[0].refreshToken,
                        grant_type: 'refresh_token',
                        client_id: this.twitterCfg.client_id
                    })
                };
                const fetchUrl = this.twitterUrl + authUrl;
                const result = yield (yield (0, node_fetch_1.default)(fetchUrl, refreshParams)).json();
                if ('error' in result) {
                    console.error(`fetching refresh token for twitter user ${id} error=${result.error} description=${result.error_description}`);
                    return null;
                }
                const expiration = new Date();
                data = {
                    userId: twitterTokens[0].userId,
                    platform: twitterTokens[0].platform,
                    platformUserId: twitterTokens[0].platformUserId,
                    accessToken: result.access_token,
                    refreshToken: result.refresh_token,
                    expiration: new Date(expiration.getTime() + result.expires_in),
                    claims: twitterTokens[0].claims || { handle: '' },
                    updatedAt: new Date()
                };
                yield this.repository.upsertUserTokens(data);
                return data;
            }
            catch (err) {
                console.error(`fetching refresh from twitter token error=${err}`);
                return null;
            }
        });
        this.setStartDate = (twitterUserId, startDate = null) => __awaiter(this, void 0, void 0, function* () {
            if (startDate) {
                this.startDate = startDate.toISOString();
            }
            else {
                this.startDate = (yield this.repository.getTweetsLastUpdate(twitterUserId)).toISOString();
            }
        });
        this.importTweets = (twitterUserId, userToken = null) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getUserTweets(twitterUserId, userToken);
            if (data.length <= 0) {
                return [[], 0];
            }
            const formatedData = yield this.formatTweets(data);
            let jobs = [];
            let result = 0;
            console.log("Tweets to Insert: ", formatedData.length);
            let indexAdjust = 0;
            for (let i = 0; i < formatedData.length; i++) {
                jobs.push(this.postPrepper.twitter(formatedData[i].embed));
                if (jobs.length >= 10 || formatedData.length - 1 === i) {
                    const r = yield Promise.all(jobs);
                    r.forEach((item, idx) => {
                        const { maxWidth, aspectRatio } = item;
                        const dataIndex = indexAdjust * 10 + idx;
                        formatedData[dataIndex].max_width = maxWidth;
                        formatedData[dataIndex].aspect_ratio = aspectRatio;
                    });
                    const resultCnt = yield this.repository.upsertTweets(formatedData);
                    indexAdjust += 1;
                    jobs = [];
                }
            }
            result += formatedData.length;
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
                this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token;
            }
            let data = [];
            let counter = 0;
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
                        if (Object.keys(response.meta).includes('next_token')) {
                            nextToken = response.meta.next_token;
                            continue;
                        }
                        else if (counter > 0) {
                            this.startDate = '';
                            return data;
                        }
                        else {
                            this.startDate = '';
                            return [];
                        }
                    }
                    responseData = response.data;
                    counter += responseData ? responseData.length : 0;
                    if (token && !responseData) {
                        const newToken = yield this.refreshTokensbyId('platform_user_id', twitterUserId);
                        if (newToken) {
                            this.params.headers.authorization = 'BEARER ' + newToken.accessToken;
                            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                            responseData = response.data;
                            counter += responseData ? responseData.length : 0;
                            if (!responseData) {
                                this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token;
                                response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                                responseData = response.data;
                                counter += responseData ? responseData.length : 0;
                                if (!responseData) {
                                    this.startDate = '';
                                    throw new Error(`Tried auth and api key, both failed for twitter user id: ${twitterUserId}`);
                                }
                            }
                        }
                        else {
                            this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token;
                            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                            responseData = response.data;
                            counter += responseData ? responseData.length : 0;
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
                if (err instanceof Error) {
                    console.warn(err.message);
                }
                console.warn(`returning null because error occurred for ${twitterUserId}`);
                return [];
            }
            this.startDate = '';
            return data;
        });
        this.formatTweets = (rawTweets) => __awaiter(this, void 0, void 0, function* () {
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
                    twitter_created_at: rawTweets[i].created_at,
                    aspect_ratio: 0,
                    max_width: 0
                });
            }
            return formatedTweets;
        });
        this.importUserByToken = (twitterUser) => __awaiter(this, void 0, void 0, function* () {
            let data;
            let token;
            data = yield this.getUserInfoByToken(twitterUser.accessToken);
            if (!data) {
                const newToken = yield this.refreshTokensbyId('user_id', twitterUser.userId);
                if (!newToken) {
                    throw new Error(`Failed to import user for user id: ${twitterUser.userId}`);
                }
                data = yield this.getUserInfoByToken(twitterUser.accessToken);
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
            };
            const formatedData = this.formatUser([data])[0];
            let dummyTokens = (yield this.repository.getTokens('platform_user_id', [token.platformUserId], 'twitter'));
            if (dummyTokens.length && twitterUser.userId !== dummyTokens[0].userId) {
                const dummyCheck = yield this.repository.isUserIdDummy(dummyTokens[0].userId);
                if (dummyCheck) {
                    yield this.repository.mergeDummyAccounts({
                        newUserId: twitterUser.userId,
                        dummyUserId: dummyTokens[0].userId
                    });
                }
                else {
                    throw new Error("This account is claimed by another non-dummy user.");
                }
            }
            yield this.repository.upsertUserTokens(token);
            const result = yield this.repository.upsertTwitterUser([formatedData]);
            return [formatedData, result];
        });
        this.importUserByHandle = (handles) => __awaiter(this, void 0, void 0, function* () {
            if (typeof handles === 'string') {
                handles = [handles];
            }
            const data = yield this.getUserInfo(handles);
            if (data === null || data.length <= 0) {
                return [];
            }
            const formatedData = this.formatUser(data);
            const result = yield this.repository.upsertTwitterUser(formatedData);
            return formatedData;
        });
        this.getUserInfo = (handles) => __awaiter(this, void 0, void 0, function* () {
            let data;
            try {
                this.params.headers.authorization = 'BEARER ' + this.twitterCfg.bearer_token;
                const userInfoEndpoint = "/users/by?";
                const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                    usernames: handles.join(),
                    "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username",
                });
                const response = yield (0, node_fetch_1.default)(fetchUrl, this.params);
                data = (yield response.json()).data;
                return data;
            }
            catch (err) {
                console.log(err);
                return [];
            }
        });
        this.getUserInfoByToken = (token) => __awaiter(this, void 0, void 0, function* () {
            let data;
            try {
                this.params.headers.authorization = 'BEARER ' + token;
                const userInfoEndpoint = "/users/me?";
                const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                    "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username"
                });
                const response = yield (0, node_fetch_1.default)(fetchUrl, this.params);
                data = (yield response.json()).data;
                return data;
            }
            catch (err) {
                console.log(err);
                return null;
            }
        });
        this.formatUser = (rawUsers) => {
            let formatedUsers = [];
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
                });
            }
            return formatedUsers;
        };
        this.twitterCfg = twitterCfg;
        this.repository = repository;
        this.twitterUrl = "https://api.twitter.com/2";
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterCfg.bearer_token
            }
        };
        this.startDate = '';
        this.defaultStartDateDays = 90;
        this.postPrepper = postPrepper;
    }
}
exports.default = Twitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUVBLDREQUErQjtBQUkvQixNQUFxQixPQUFPO0lBU3hCLFlBQVksVUFBeUIsRUFBRSxVQUFzQixFQUFFLFdBQXdCO1FBZXZGLHNCQUFpQixHQUFHLENBQU8sTUFBYyxFQUFFLEVBQVUsRUFBaUMsRUFBRTtZQUNwRixJQUFJO2dCQUNBLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQy9FLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQztnQkFDaEMsSUFBSSxJQUFtQixDQUFDO2dCQUV4QixJQUFJLGFBQWEsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO29CQUM3RCxPQUFPLElBQUksQ0FBQTtpQkFDZDtnQkFFRCxNQUFNLGFBQWEsR0FBRztvQkFDbEIsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFO3dCQUNMLGNBQWMsRUFBRSxrQkFBa0I7cUJBQ3JDO29CQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO3dCQUNqQixhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVk7d0JBQzVDLFVBQVUsRUFBRSxlQUFlO3dCQUMzQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTO3FCQUN2QyxDQUFDO2lCQUNMLENBQUE7Z0JBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7Z0JBQzNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUEsb0JBQUssRUFBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENB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QUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzVJLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNuSSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDbkksUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMs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