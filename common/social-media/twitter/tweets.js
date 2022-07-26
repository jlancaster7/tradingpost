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
    constructor(twitterConfig, pg_client, pgp) {
        this.setStartDate = (startDate) => __awaiter(this, void 0, void 0, function* () {
            this.startDate = startDate.toISOString();
        });
        this.getStartDate = (twitter_user_id) => __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT twitter_user_id, MAX(created_at) FROM tweets WHERE twitter_user_id = $1 GROUP BY twitter_user_id ';
            const result = yield this.pg_client.result(query, [twitter_user_id]);
            if (result.rowCount === 0) {
                let defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() - this.defaultStartDateDays);
                yield this.setStartDate(defaultDate);
            }
            else {
                yield this.setStartDate(result.rows[0].max);
            }
        });
        this.importTweets = (twitterUserId, userToken = null) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getUserTweets(twitterUserId, userToken);
            if (data === []) {
                return [[], 0];
            }
            const formatedData = this.formatTweets(data);
            const result = yield this.appendTweets(formatedData);
            return [formatedData, result];
        });
        this.getUserTweets = (twitterUserId, userToken) => __awaiter(this, void 0, void 0, function* () {
            if (this.startDate === '') {
                yield this.getStartDate(twitterUserId);
            }
            if (userToken) {
                this.params.headers.authorization = 'BEARER ' + userToken;
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
                while (nextToken !== 'end') {
                    if (nextToken === '') {
                        fetchUrl = this.twitterUrl + tweetsEndpoints + new URLSearchParams({
                            exclude: "replies",
                            max_results: '5',
                            start_time: this.startDate,
                            "tweet.fields": "id,lang,public_metrics,text,attachments,entities,created_at,possibly_sensitive",
                        });
                    }
                    else {
                        fetchUrl = this.twitterUrl + tweetsEndpoints + new URLSearchParams({
                            exclude: "replies",
                            max_results: '5',
                            pagination_token: nextToken,
                            start_time: this.startDate,
                            "tweet.fields": "id,lang,public_metrics,text,attachments,entities,created_at,possibly_sensitive",
                        });
                    }
                    response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                    responseData = response.data;
                    if (responseData === undefined) {
                        this.startDate = '';
                        return data;
                    }
                    for (let i = 0; i < responseData.length; i++) {
                        tweetUrl = `https://twitter.com/${responseData[i].username}/status/${responseData[i].id}`;
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
                    urls: urls,
                    media_keys: mediaKeys,
                    annotations: annotations,
                    cashtags: cashtags,
                    hashtags: hashtags,
                    mentions: mentions,
                    twitter_created_at: rawTweets[i].created_at
                });
            }
            return formatedTweets;
        };
        this.appendTweets = (formatedTweets) => __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            try {
                let values;
                let query;
                let result;
                let value_index = '';
                for (let i = 0; i < formatedTweets.length; i++) {
                    values = Object.values(formatedTweets[i]);
                    value_index = '';
                    values.map((obj, index) => {
                        value_index += `$${index + 1}, `;
                    });
                    value_index = value_index.substring(0, value_index.length - 2);
                    query = `INSERT INTO tweets(tweet_id, twitter_user_id, embed, lang, like_count, quote_count,
                                            reply_count, retweet_count, possibly_sensitive, text, tweet_url, urls,
                                            media_keys, annotations, cashtags, hashtags, mentions, twitter_created_at)
                         VALUES (${value_index})
                         ON CONFLICT (tweet_id) DO UPDATE SET like_count    = EXCLUDED.like_count,
                                                              quote_count   = EXCLUDED.quote_count,
                                                              reply_count   = EXCLUDED.reply_count,
                                                              retweet_count = EXCLUDED.retweet_count`;
                    result = yield this.pg_client.result(query, values);
                    success += result.rowCount;
                }
            }
            catch (err) {
                console.log(err);
            }
            return success;
        });
        this.twitterConfig = twitterConfig;
        this.pg_client = pg_client;
        this.pgp = pgp;
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
