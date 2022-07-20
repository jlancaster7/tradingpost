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
            let query = 'SELECT twitter_user_id, MAX(created_at) FROM tweets WHERE twitter_user_id = $1 GROUP BY twitter_user_id ';
            let result = yield this.pg_client.result(query, [twitter_user_id]);
            if (result.rowCount === 0) {
                let defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() - this.defaultStartDateDays);
                yield this.setStartDate(defaultDate);
            }
            else {
                yield this.setStartDate(result.rows[0].max);
            }
        });
        this.importTweets = (twitterUserId) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getUserTweets(twitterUserId);
            if (data === []) {
                return [[], 0];
            }
            const formatedData = this.formatTweets(data);
            const result = yield this.appendTweets(formatedData);
            return [formatedData, result];
        });
        this.getUserTweets = (twitterUserId) => __awaiter(this, void 0, void 0, function* () {
            if (this.startDate === '') {
                yield this.getStartDate(twitterUserId);
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
            let keys;
            let formatedTweets = JSON.parse(JSON.stringify(rawTweets));
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
                    formatedTweets[i].media_keys = JSON.stringify({ data: rawTweets[i].attachments.media_keys });
                    delete formatedTweets[i].attachments;
                }
                if (Object.keys(rawTweets[i]).includes('entities')) {
                    keys = Object.keys(rawTweets[i].entities);
                    if (keys.includes('urls')) {
                        formatedTweets[i].urls = JSON.stringify(rawTweets[i].entities.urls);
                    }
                    if (keys.includes('annotations')) {
                        formatedTweets[i].annotations = JSON.stringify(rawTweets[i].entities.annotations);
                    }
                    if (keys.includes('cashtags')) {
                        formatedTweets[i].cashtags = JSON.stringify(rawTweets[i].entities.cashtags);
                    }
                    if (keys.includes('mentions')) {
                        formatedTweets[i].mentions = JSON.stringify(rawTweets[i].entities.mentions);
                    }
                    if (keys.includes('hashtags')) {
                        formatedTweets[i].hashtags = JSON.stringify(rawTweets[i].entities.hashtags);
                    }
                    delete formatedTweets[i].entities;
                }
            }
            return formatedTweets;
        };
        this.appendTweets = (formatedTweets) => __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            try {
                let keys;
                let values;
                let query;
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
