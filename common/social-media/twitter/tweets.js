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
        this.refreshTokensbyId = (idType, ids) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.repository.getTokens(idType, ids, 'twitter');
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
                    if (!response) {
                        continue;
                    }
                    data.push({
                        userId: d.user_id,
                        platform: d.platform,
                        platformUserId: d.platform_user_id,
                        accessToken: response.access_token,
                        refreshToken: response.refresh_token,
                        expiration: response.expires_in
                    });
                }
                yield this.repository.upsertUserTokens(data);
                return data;
            }
            catch (err) {
                console.error(err);
                return [];
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
                    responseData = response.data;
                    console.log(response);
                    if (token && !responseData) {
                        const newToken = yield this.refreshTokensbyId('platform_user_id', [twitterUserId]);
                        this.params.headers.authorization = 'BEARER ' + newToken[0].accessToken;
                        response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                        responseData = response.data;
                        if (!responseData) {
                            this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'];
                            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                            responseData = response.data;
                            if (!responseData) {
                                this.startDate = '';
                                return [];
                            }
                        }
                    }
                    else if (!responseData) {
                        this.startDate = '';
                        return [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdlZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdlZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDREQUErQjtBQUsvQixNQUFhLE1BQU07SUFRZixZQUFZLGFBQTRCLEVBQUUsVUFBc0I7UUFjaEUsaUJBQVksR0FBRyxDQUFPLGFBQXFCLEVBQUUsWUFBeUIsSUFBSSxFQUFFLEVBQUU7WUFDMUUsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzdGO1FBRUwsQ0FBQyxDQUFBLENBQUE7UUFDRCxzQkFBaUIsR0FBRyxDQUFPLE1BQWMsRUFBRSxHQUFhLEVBQTRCLEVBQUU7WUFDbEYsSUFBSTtnQkFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQztnQkFDaEMsSUFBSSxJQUFJLEdBQW9CLEVBQUUsQ0FBQztnQkFDL0IsS0FBSyxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7b0JBQ3BCLE1BQU0sYUFBYSxHQUFHO3dCQUNsQixNQUFNLEVBQUUsTUFBTTt3QkFDZCxPQUFPLEVBQUU7NEJBQ0wsY0FBYyxFQUFFLG1DQUFtQzt5QkFDdEQ7d0JBQ0QsSUFBSSxFQUFFOzRCQUNGLGFBQWEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWE7NEJBQ3JDLFVBQVUsRUFBRSxlQUFlOzRCQUMzQixTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRO3lCQUN6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QUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDekksV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzVJLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNuSSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDbkksUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ25JLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVO2lCQUM5QyxDQUFDLENBQUE7YUFDTDtZQUNELE9BQU8sY0FBYyxDQUFDO1FBQzFCLENBQUMsQ0FBQTtRQTFNRyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1YsTUFBTSxFQUFFLEtBQUs7WUFDYixPQUFPLEVBQUU7Z0JBQ0wsYUFBYSxFQUFFLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBVzthQUMxRTtTQUNKLENBQUE7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLDJCQUEyQixDQUFDO1FBQzlDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFDbkMsQ0FBQztDQWlNSjtBQXJORCx3QkFxTkMifQ==