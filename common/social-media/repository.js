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
                              LEFT JOIN (SELECT platform_user_id, access_token, refresh_token
                                         FROM data_platform_claim
                                         WHERE platform = 'twitter') as a
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
                              LEFT JOIN (SELECT platform_user_id, access_token, refresh_token
                                         FROM data_platform_claim
                                         WHERE platform = 'youtube') as b
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
                     FROM youtube_videos
                     WHERE youtube_channel_id = $1
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
                     FROM spotify_episodes
                     WHERE spotify_show_id = $1
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
                       WHERE $1 IN ($2:list)
                         AND platform = '$3'`;
            const response = yield this.db.query(query, [idType, ids.join(', '), platform]);
            return response;
        });
        this.upsertUserTokens = (twitterUsers) => __awaiter(this, void 0, void 0, function* () {
            // TODO: add query to upsert token into third-party claims table
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'platform', prop: 'platform' },
                { name: 'platform_user_id', prop: 'platformUserId' },
                { name: 'access_token', prop: 'accessToken' },
                { name: 'refresh_token', prop: 'refreshToken' },
                { name: 'expiration', prop: 'expiration' }
            ], { table: 'data_platform_claim' });
            const query = this.pgp.helpers.insert(twitterUsers, cs) + ` ON CONFLICT ON CONSTRAINT platform_platform_user_id_key DO UPDATE SET
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxNQUFxQixVQUFVO0lBSzNCLFlBQVksRUFBa0IsRUFBRSxHQUFVO1FBTTFDLG9CQUFlLEdBQUcsR0FBaUQsRUFBRTtZQUNqRSxJQUFJLEtBQUssR0FBRzs7U0FFWCxDQUFDO1lBRUYsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxPQUFPLGNBQWMsQ0FBQztRQUMxQixDQUFDLENBQUEsQ0FBQTtRQUNELG9CQUFlLEdBQUcsR0FBOEYsRUFBRTtZQUM5RyxJQUFJLEtBQUssR0FBRzs7Ozs7O1NBTVgsQ0FBQztZQUVGLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQyxDQUFBLENBQUE7UUFFRCxxQkFBZ0IsR0FBRyxHQUFrRCxFQUFFO1lBQ25FLElBQUksS0FBSyxHQUFHOztTQUVYLENBQUM7WUFFRixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE9BQU8sV0FBVyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQSxDQUFBO1FBQ0Qsb0JBQWUsR0FBRyxHQUFpRyxFQUFFO1lBQ2pILElBQUksS0FBSyxHQUFHOzs7Ozs7U0FNWCxDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDLENBQUEsQ0FBQTtRQUVELHdCQUFtQixHQUFHLENBQU8sYUFBcUIsRUFBaUIsRUFBRTtZQUNqRSxJQUFJ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