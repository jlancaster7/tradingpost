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
        this.getSpotifyUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT spotify_show_id 
                     FROM spotify_users
                     `;
            const spotifyShowIds = yield this.db.query(query);
            return spotifyShowIds;
        });
        this.getTwitterUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT twitter_user_id, a.access_token, a.refresh_token
                     FROM twitter_users
                     LEFT JOIN (SELECT platform_user_id, access_token, refresh_token FROM data_platform_claim WHERE platform = 'twitter') as a
                     ON twitter_users.twitter_user_id = a.platform_user_id
                     `;
            const twitterIds = yield this.db.query(query);
            return twitterIds;
        });
        this.getSubstackUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT substack_user_id
                     FROM substack_users
                     `;
            const substackIds = yield this.db.query(query);
            return substackIds;
        });
        this.getYoutubeUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT a.youtube_channel_id, b.access_token, b.refresh_token
                     FROM youtube_users as a
                     LEFT JOIN (SELECT platform_user_id, access_token, refresh_token FROM data_platform_claim WHERE platform = 'youtube') as b
                     ON a.youtube_channel_id = b.platform_user_id
                     `;
            const channelIds = yield this.db.query(query);
            return channelIds;
        });
        this.getTweetsLastUpdate = (twitterUserId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT twitter_user_id, MAX(created_at) 
                     FROM tweets 
                     WHERE twitter_user_id = $1 
                     GROUP BY twitter_user_id`;
            let result = yield this.db.result(query, [twitterUserId]);
            if (!result.rows.length) {
                let defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() - 90);
                return defaultDate;
            }
            else {
                return result.rows[0].max;
            }
        });
        this.getYoutubeLastUpdate = (youtubeChannelId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT youtube_channel_id, MAX(created_at) 
                     FROM youtube_videos WHERE youtube_channel_id = $1 
                     GROUP BY youtube_channel_id`;
            let result = yield this.db.result(query, [youtubeChannelId]);
            if (!result.rows.length) {
                return new Date('1/1/2018');
            }
            else {
                return result.rows[0].max;
            }
        });
        this.getSpotifyLastUpdate = (spotify_show_id) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT spotify_show_id, MAX(release_date) 
                        FROM spotify_episodes WHERE spotify_show_id = $1 
                        GROUP BY spotify_show_id`;
            let result = yield this.db.result(query, [spotify_show_id]);
            if (!result.rows.length) {
                return new Date('1/1/2018');
            }
            else {
                return result.rows[0].max;
            }
        });
        this.getTokens = (idType, ids, platform) => __awaiter(this, void 0, void 0, function* () {
            try {
                const query = `SELECT id,
                                  platform,
                                  platform_user_id,
                                  access_token,
                                  refresh_token,
                                  expiration,
                                  claims,
                                  user_id,
                                  created_at,
                                  updated_at
                            FROM data_platform_claim
                            WHERE ${idType} IN ($1) AND platform = $2
                `;
                const response = yield this.db.many(query, [ids.join(', '), platform]);
                let result = [];
                for (let i = 0; i < response.length; i++) {
                    result.push({
                        userId: response[i].user_id,
                        platform: response[i].platform,
                        platformUserId: response[i].platform_user_id,
                        accessToken: response[i].access_token,
                        refreshToken: response[i].refresh_token,
                        expiration: response[i].expiration,
                        updatedAt: response[i].updated_at
                    });
                }
                return result;
            }
            catch (error) {
                return [];
            }
        });
        this.upsertUserTokens = (userTokens) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'platform', prop: 'platform' },
                { name: 'platform_user_id', prop: 'platformUserId' },
                { name: 'access_token', prop: 'accessToken' },
                { name: 'refresh_token', prop: 'refreshToken' },
                { name: 'expiration', prop: 'expiration' },
                { name: 'updated_at', prop: 'updatedAt' }
            ], { table: 'data_platform_claim' });
            const query = this.pgp.helpers.insert(userTokens, cs) + ` ON CONFLICT ON CONSTRAINT platform_platform_user_id_key DO UPDATE SET
                                                                    access_token = EXCLUDED.access_token,
                                                                    refresh_token = EXCLUDED.refresh_token,
                                                                    expiration = EXCLUDED.expiration,
                                                                    updated_at = EXCLUDED.updated_at
                                                                    `;
            const result = yield this.db.result(query);
            return result;
        });
        this.isUserIdDummy = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT dummy FROM data_user WHERE id = $1`;
            return (yield this.db.one(query, [userId])).dummy;
        });
        this.mergeDummyAccounts = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                let tableQuery = `SELECT c.conrelid::regclass AS table_from
                                  FROM pg_constraint c
                                      INNER JOIN pg_namespace n
                                                 ON n.oid = c.connamespace
                                      CROSS JOIN LATERAL unnest(c.conkey) ak(k)
                                      INNER JOIN pg_attribute a
                                                 ON a.attrelid = c.conrelid
                                                 AND a.attnum = ak.k
                                  WHERE c.confrelid::regclass::text = 'data_user'
                                  and a.attname = 'user_id'
                                  and c.contype = 'f'
                                  `;
                const tableResponse = yield this.db.query(tableQuery);
                console.log(userId);
                yield this.db.tx((t) => __awaiter(this, void 0, void 0, function* () {
                    let updateQueries = [];
                    for (let d of tableResponse) {
                        updateQueries.push(this.db.oneOrNone(`UPDATE ${d.table_from}
                                    SET user_id = '${userId.newUserId}'
                                    WHERE user_id = '${userId.dummyUserId}'
                                    `));
                    }
                    updateQueries.push(this.db.none(`DELETE FROM data_user
                                                WHERE id = '${userId.dummyUserId}'
                                                AND dummy = true`));
                    return t.batch(updateQueries);
                }));
            }
            catch (err) {
                console.error(err);
                throw new Error(`Merge for newUserId: ${userId.newUserId} dummyUserId: ${userId.dummyUserId} failed`);
            }
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
                console.error(err);
                throw err;
            }
        });
        this.insertSubstackArticles = (formattedArticles) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'substack_user_id', prop: 'substack_user_id' },
                    { name: 'creator', prop: 'creator' },
                    { name: 'title', prop: 'title' },
                    { name: 'link', prop: 'link' },
                    { name: 'substack_created_at', prop: 'substack_created_at' },
                    { name: 'content_encoded', prop: 'content_encoded' },
                    { name: 'content_encoded_snippet', prop: 'content_encoded_snippet' },
                    { name: 'enclosure', prop: 'enclosure' },
                    { name: 'dc_creator', prop: 'dc_creator' },
                    { name: 'content', prop: 'content' },
                    { name: 'content_snippet', prop: 'content_snippet' },
                    { name: 'article_id', prop: 'article_id' },
                    { name: 'itunes', prop: 'itunes' },
                ], { table: 'substack_articles' });
                const query = this.pgp.helpers.insert(formattedArticles, cs) + ' ON CONFLICT DO NOTHING';
                const result = yield this.db.result(query);
                return result.rowCount;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
        this.insertSubstackUser = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'substack_user_id', prop: 'substack_user_id' },
                    { name: 'title', prop: 'title' },
                    { name: 'description', prop: 'description' },
                    { name: 'link', prop: 'link' },
                    { name: 'language', prop: 'language' },
                    { name: 'email', prop: 'email' },
                    { name: 'image', prop: 'image' },
                    { name: 'itunes', prop: 'itunes' },
                    { name: 'last_build_date', prop: 'last_build_date' },
                ], { table: 'substack_users' });
                const query = this.pgp.helpers.insert(data, cs) + ' ON CONFLICT (substack_user_id) DO NOTHING';
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                const result = yield this.db.result(query);
                return result.rowCount;
                ;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
        this.insertSpotifyEpisodes = (episodes) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'spotify_episode_id', prop: 'spotify_episode_id' },
                    { name: 'spotify_show_id', prop: 'spotify_show_id' },
                    { name: 'audio_preview_url', prop: 'audio_preview_url' },
                    { name: 'name', prop: 'name' },
                    { name: 'description', prop: 'description' },
                    { name: 'duration_ms', prop: 'duration_ms' },
                    { name: 'explicit', prop: 'explicit' },
                    { name: 'html_description', prop: 'html_description' },
                    { name: 'is_externally_hosted', prop: 'is_externally_hosted' },
                    { name: 'is_playable', prop: 'is_playable' },
                    { name: 'language', prop: 'language' },
                    { name: 'languages', prop: 'languages' },
                    { name: 'embed', prop: 'embed' },
                    { name: 'external_urls', prop: 'external_urls' },
                    { name: 'images', prop: 'images' },
                    { name: 'release_date', prop: 'release_date' },
                ], { table: 'spotify_episodes' });
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                const query = this.pgp.helpers.insert(episodes, cs) + ' ON CONFLICT DO NOTHING';
                const results = yield this.db.result(query);
                if (!results)
                    return 0;
                return results.rowCount;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
        this.upsertSpotifyShow = (formattedShows) => __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'spotify_show_id', prop: 'spotify_show_id' },
                    { name: 'name', prop: 'name' },
                    { name: 'description', prop: 'description' },
                    { name: 'explicit', prop: 'explicit' },
                    { name: 'html_description', prop: 'html_description' },
                    { name: 'is_externally_hosted', prop: 'is_externally_hosted' },
                    { name: 'media_type', prop: 'media_type' },
                    { name: 'publisher', prop: 'publisher' },
                    { name: 'copyrights', prop: 'copyrights' },
                    { name: 'total_episodes', prop: 'total_episodes' },
                    { name: 'languages', prop: 'languages' },
                    { name: 'external_urls', prop: 'external_urls' },
                    { name: 'images', prop: 'images' },
                ], { table: 'spotify_users' });
                const query = this.pgp.helpers.insert(formattedShows, cs) + ` ON CONFLICT ON CONSTRAINT spotify_users_spotify_show_id_key DO UPDATE SET
                                                                          name = EXCLUDED.name,
                                                                          description = EXCLUDED.description,
                                                                          html_description = EXCLUDED.html_description,
                                                                          total_episodes = EXCLUDED.total_episodes,
                                                                          external_urls = EXCLUDED.external_urls,
                                                                          images - EXCLUDED.images
                                                                          `;
                const results = yield this.db.result(query);
                if (!results)
                    return 0;
                return results.rowCount;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
        this.insertYoutubeVideos = (formattedVideos) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'video_id', prop: 'video_id' },
                    { name: 'youtube_channel_id', prop: 'youtube_channel_id' },
                    { name: 'youtube_created_at', prop: 'youtube_created_at' },
                    { name: 'title', prop: 'title' },
                    { name: 'description', prop: 'description' },
                    { name: 'thumbnails', prop: 'thumbnails' },
                    { name: 'video_url', prop: 'video_url' },
                    { name: 'video_embed', prop: 'video_embed' },
                ], { table: 'youtube_videos' });
                const query = this.pgp.helpers.insert(formattedVideos, cs) + ' ON CONFLICT DO NOTHING;';
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                const result = yield this.db.result(query);
                return result.rowCount;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
        this.insertChannelInfo = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'youtube_channel_id', prop: 'youtube_channel_id' },
                    { name: 'title', prop: 'title' },
                    { name: 'description', prop: 'description' },
                    { name: 'country', prop: 'country' },
                    { name: 'custom_url', prop: 'custom_url' },
                    { name: 'youtube_created_at', prop: 'youtube_created_at' },
                    { name: 'thumbnails', prop: 'thumbnails' },
                    { name: 'statistics', prop: 'statistics' },
                    { name: 'status', prop: 'status' },
                ], { table: 'youtube_users' });
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                const query = this.pgp.helpers.insert(data, cs) + `ON CONFLICT DO NOTHING`;
                const result = yield this.db.result(query);
                return result.rowCount;
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.default = Repository;
