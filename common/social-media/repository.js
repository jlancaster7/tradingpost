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
Object.defineProperty(exports, "__esModule", { value: true });
class Repository {
    constructor(db, pgp) {
        this.getTweetsLastUpdate = (twitterUserId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT twitter_user_id, MAX(created_at) 
                     FROM tweets 
                     WHERE twitter_user_id = $1 
                     GROUP BY twitter_user_id`;
            let result = yield this.db.any(query, [twitterUserId]);
            if (result.length === 0) {
                let defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() - this.defaultStartDateDays);
                return defaultDate;
            }
            else {
                return result[0].max;
            }
        });
        this.getTokens = (userIds, platform) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              platform,
                              platform_user_id,
                              access_token,
                              refresh_token,
                              epxiration,
                              claims,
                              user_id,
                              created_at,
                              updated_at
                       FROM data_platform_claim
                       WHERE user_id IN ($1) AND platform = '$2'
                       `;
            const response = yield this.db.query(query, [userIds.join(', '), platform]);
            return response;
        });
        this.upsertUserTokens = (twitterUsers) => __awaiter(this, void 0, void 0, function* () {
            // TODO: add query to upsert token into third-party claims table
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'userId', prop: 'user_id' },
                { name: 'platform', prop: 'platform' },
                { name: 'platformUserId', prop: 'platform_user_id' },
                { name: 'accessToken', prop: 'access_token' },
                { name: 'refreshToken', prop: 'refresh_token' },
                { name: 'expiration', prop: 'expires_in' }
            ], { table: 'data_platform_claim' });
            const query = this.pgp.helpers.insert(twitterUsers, cs) + ` ON CONFLICT platform_platform_user_id_key DO UPDATE SET
                                                                    access_token = EXCLUDED.access_token,
                                                                    refresh_token = EXCLUDED.refresh_token,
                                                                    expiration = EXCLUDED.expiration
                                                                    `;
            const result = yield this.db.result(query);
            return result;
        });
        this.upsertTweets = (formatedTweets) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'tweet_id', prop: 'tweet_id' },
                    { name: 'twitter_user_id', prop: 'twitter_user_id' },
                    { name: 'embed', prop: 'embed' },
                    { name: 'lang', prop: 'lang' },
                    { name: 'like_count', prop: 'like_count' },
                    { name: 'quote_count', prop: 'quote_count' },
                    { name: 'reply_count', prop: 'reply_count' },
                    { name: 'retweet_count', prop: 'retweet_count' },
                    { name: 'possibly_sensitive', prop: 'possibly_sensitive' },
                    { name: 'text', prop: 'text' },
                    { name: 'tweet_url', prop: 'tweet_url' },
                    { name: 'urls', prop: 'urls' },
                    { name: 'media_keys', prop: 'media_keys' },
                    { name: 'annotations', prop: 'annotations' },
                    { name: 'cashtags', prop: 'cashtags' },
                    { name: 'hashtags', prop: 'hashtags' },
                    { name: 'mentions', prop: 'mentions' },
                    { name: 'twitter_created_at', prop: 'twitter_created_at' }
                ], { table: 'tweets' });
                const query = this.pgp.helpers.insert(formatedTweets, cs) + ` ON CONFLICT ON CONSTRAINT tweets_tweet_id_key DO UPDATE SET
                                                                            like_count = EXCLUDED.like_count,
                                                                            quote_count = EXCLUDED.quote_count,
                                                                            reply_count = EXCLUDED.reply_count,
                                                                            retweet_count = EXCLUDED.retweet_count
                                                                            `;
                const result = yield this.db.result(query);
                return result.rowCount;
            }
            catch (err) {
                //console.log(err);
                return 0;
            }
        });
        this.upsertTwitterUser = (users) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'protected', prop: 'protected' },
                    { name: 'display_name', prop: 'display_name' },
                    { name: 'follower_count', prop: 'follower_count' },
                    { name: 'following_count', prop: 'following_count' },
                    { name: 'location', prop: 'location' },
                    { name: 'twitter_created_at', prop: 'twitter_created_at' },
                    { name: 'username', prop: 'username' },
                    { name: 'description', prop: 'description' },
                    { name: 'profile_image_url', prop: 'profile_image_url' },
                    { name: 'profile_url', prop: 'profile_url' },
                    { name: 'twitter_user_id', prop: 'twitter_user_id' },
                ], { table: 'twitter_users' });
                const query = this.pgp.helpers.insert(users, cs) + ` ON CONFLICT ON CONSTRAINT twitter_users_twitter_user_id_key DO UPDATE SET
                                                                 display_name = EXCLUDED.display_name,
                                                                 follower_count = EXCLUDED.follower_count,
                                                                 following_count = EXCLUDED.following_count,
                                                                 description = EXCLUDED.description,
                                                                 profile_image_url = EXCLUDED.profile_image_url,
                                                                 profile_url = EXCLUDED.profile_url
                                                                 `;
                const result = yield this.db.result(query);
                return result.rowCount;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
        this.db = db;
        this.pgp = pgp;
        this.defaultStartDateDays = 90;
    }
}
exports.default = Repository;
