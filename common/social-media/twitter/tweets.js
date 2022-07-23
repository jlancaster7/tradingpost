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
                    console.log(fetchUrl);
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
            let formatedTweets = [];
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
                    urls: (rawTweets[i].entities.urls ? JSON.stringify(rawTweets[i].entities.urls) : null),
                    media_keys: (rawTweets[i].entities.media_keys ? JSON.stringify(rawTweets[i].entities.media_keys) : null),
                    annotations: (rawTweets[i].entities.annotations ? JSON.stringify(rawTweets[i].entities.annotations) : null),
                    cashtags: (rawTweets[i].entities.cashtags ? JSON.stringify(rawTweets[i].entities.cashtags) : null),
                    hashtags: (rawTweets[i].entities.hashtags ? JSON.stringify(rawTweets[i].entities.hashtags) : null),
                    mentions: (rawTweets[i].entities.mentions ? JSON.stringify(rawTweets[i].entities.mentions) : null),
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
                    query = `INSERT INTO tweets(tweet_id, twitter_user_id, embed, lang, like_count, quote_count, reply_count, retweet_count, possibly_sensitive, text, tweet_url, urls, media_keys, annotations, cashtags, hashtags, mentions, twitter_created_at)
                         VALUES (${value_index})
                         ON CONFLICT (tweet_id) DO UPDATE SET like_count = EXCLUDED.like_count
                                                              quote_count = EXCLUDED.quote_count
                                                              reply_count = EXCLUDED.reply_count
                                                              retweet_count = EXCLUDED.retweet_count
                                                              `;
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
