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
const luxon_1 = require("luxon");
class Repository {
    constructor(db, pgp) {
        this.getSpotifyUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT spotify_show_id
                     FROM spotify_users`;
            return yield this.db.query(query);
        });
        this.getTwitterUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT twitter_user_id, a.access_token, a.refresh_token
                     FROM twitter_users
                              LEFT JOIN (SELECT platform_user_id, access_token, refresh_token
                                         FROM data_platform_claim
                                         WHERE platform = 'twitter') as a
                                        ON twitter_users.twitter_user_id = a.platform_user_id;`;
            return yield this.db.query(query);
        });
        this.getSubstackUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT substack_user_id
                     FROM substack_users`;
            return yield this.db.query(query);
        });
        this.getSubstackArticlesAndUsersByArticleIds = (articleIds) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT sa.id                  AS id,
                            sa.substack_user_id,
                            sa.article_id,
                            sa.creator,
                            sa.title,
                            sa.link,
                            sa.content_encoded,
                            sa.content_encoded_snippet,
                            sa.enclosure,
                            sa.dc_creator,
                            sa.itunes,
                            sa.content,
                            sa.content_snippet,
                            sa.substack_created_at as substack_article_created_at,
                            sa.created_at          as tradingpost_substack_article_created_at,
                            su.title               as newsletter_title,
                            su.description         as newsletter_description,
                            su.link                as newsletter_link,
                            su.language            as newsletter_language,
                            su.email               as newsletter_email,
                            su.image               as newsletter_image,
                            su.itunes              as newsletter_itunes,
                            su.last_build_date     as last_newsletter_build_date,
                            su.created_at          as substack_added_to_tradingpost_date,
                            sa.max_width           as max_width,
                            sa.aspect_ratio        as aspect_ratio,
                            du.id                  AS tradingpost_user_id,
                            du.handle              AS tradingpost_user_handle,
                            du.email               AS tradingpost_user_email,
                            du.profile_url         AS tradingpost_user_profile_url
                     FROM substack_articles sa
                              INNER JOIN substack_users su
                                         ON su.substack_user_id = sa.substack_user_id
                              INNER JOIN data_platform_claim dpc
                                         ON dpc.platform_user_id = su.substack_user_id
                              INNER JOIN data_user du
                                         ON dpc.user_id = du.id
                     WHERE sa.article_id IN ($1:list)
                       AND sa.aspect_ratio != 0
                       AND sa.aspect_ratio IS NOT NULL
                     ORDER BY sa.id;`;
            const response = yield this.db.query(query, [articleIds]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    article_id: row.article_id,
                    content: row.content,
                    content_encoded: row.content_encoded,
                    content_encoded_snippet: row.content_encoded_snippet,
                    content_snippet: row.content_snippet,
                    creator: row.creator,
                    dc_creator: row.dc_creator,
                    enclosure: row.enclosure,
                    itunes: row.itunes,
                    last_newsletter_build_date: luxon_1.DateTime.fromJSDate(row.last_newsletter_build_date),
                    link: row.link,
                    newsletter_description: row.newsletter_description,
                    newsletter_email: row.newsletter_email,
                    newsletter_image: row.newsletter_image,
                    newsletter_itunes: row.newsletter_itunes,
                    newsletter_language: row.newsletter_language,
                    newsletter_link: row.newsletter_link,
                    newsletter_title: row.newsletter_title,
                    substack_added_to_tradingpost_date: luxon_1.DateTime.fromJSDate(row.substack_added_to_tradingpost_date),
                    substack_article_created_at: luxon_1.DateTime.fromJSDate(row.substack_article_created_at),
                    substack_user_id: row.substack_user_id,
                    title: row.title,
                    tradingpost_substack_article_created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_substack_article_created_at),
                    aspectRatio: 400 / row.aspect_ratio,
                    maxWidth: row.max_width,
                    tradingpostUserId: row.tradingpost_user_id,
                    tradingpostUserHandle: row.tradingpost_user_handle,
                    tradingpostUserEmail: row.tradingpost_user_email,
                    tradingpostProfileUrl: row.tradingpost_profile_url
                };
                return obj;
            });
        });
        this.getSubstackArticlesAndUsers = (lastId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT sa.id                  AS id,
                            sa.substack_user_id,
                            sa.article_id,
                            sa.creator,
                            sa.title,
                            sa.link,
                            sa.content_encoded,
                            sa.content_encoded_snippet,
                            sa.enclosure,
                            sa.dc_creator,
                            sa.itunes,
                            sa.content,
                            sa.content_snippet,
                            sa.substack_created_at as substack_article_created_at,
                            sa.created_at          as tradingpost_substack_article_created_at,
                            su.title               as newsletter_title,
                            su.description         as newsletter_description,
                            su.link                as newsletter_link,
                            su.language            as newsletter_language,
                            su.email               as newsletter_email,
                            su.image               as newsletter_image,
                            su.itunes              as newsletter_itunes,
                            su.last_build_date     as last_newsletter_build_date,
                            su.created_at          as substack_added_to_tradingpost_date,
                            sa.max_width           as max_width,
                            sa.aspect_ratio        as aspect_ratio,
                            du.id                  AS tradingpost_user_id,
                            du.handle              AS tradingpost_user_handle,
                            du.email               AS tradingpost_user_email,
                            du.profile_url         AS tradingpost_user_profile_url
                     FROM substack_articles sa
                              INNER JOIN substack_users su
                                         ON su.substack_user_id = sa.substack_user_id
                              INNER JOIN data_platform_claim dpc
                                         ON dpc.platform_user_id = su.substack_user_id
                              INNER JOIN data_user du
                                         ON dpc.user_id = du.id
                     WHERE sa.id > $1
                       AND sa.aspect_ratio != 0
                       AND sa.aspect_ratio IS NOT NULL
                     ORDER BY sa.id;`;
            const response = yield this.db.query(query, [lastId]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    id: row.id,
                    created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_substack_article_created_at),
                    article_id: row.article_id,
                    content: row.content,
                    content_encoded: row.content_encoded,
                    content_encoded_snippet: row.content_encoded_snippet,
                    content_snippet: row.content_snippet,
                    creator: row.creator,
                    dc_creator: row.dc_creator,
                    enclosure: row.enclosure,
                    itunes: row.itunes,
                    last_newsletter_build_date: luxon_1.DateTime.fromJSDate(row.last_newsletter_build_date),
                    link: row.link,
                    newsletter_description: row.newsletter_description,
                    newsletter_email: row.newsletter_email,
                    newsletter_image: row.newsletter_image,
                    newsletter_itunes: row.newsletter_itunes,
                    newsletter_language: row.newsletter_language,
                    newsletter_link: row.newsletter_link,
                    newsletter_title: row.newsletter_title,
                    substack_added_to_tradingpost_date: luxon_1.DateTime.fromJSDate(row.substack_added_to_tradingpost_date),
                    substack_article_created_at: luxon_1.DateTime.fromJSDate(row.substack_article_created_at),
                    substack_user_id: row.substack_user_id,
                    title: row.title,
                    tradingpost_substack_article_created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_substack_article_created_at),
                    aspectRatio: 400 / row.aspect_ratio,
                    maxWidth: row.max_width,
                    tradingpostUserId: row.tradingpost_user_id,
                    tradingpostUserHandle: row.tradingpost_user_handle,
                    tradingpostUserEmail: row.tradingpost_user_email,
                    tradingpostProfileUrl: row.tradingpost_profile_url
                };
                return obj;
            });
        });
        this.getYoutubeUsers = () => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT a.youtube_channel_id, b.access_token, b.refresh_token
                     FROM youtube_users as a
                              LEFT JOIN (SELECT platform_user_id, access_token, refresh_token
                                         FROM data_platform_claim
                                         WHERE platform = 'youtube') as b
                                        ON a.youtube_channel_id = b.platform_user_id`;
            return yield this.db.query(query);
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
                // @ts-ignore
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
                // @ts-ignore
                return result.rows[0].max;
            }
        });
        this.getSpotifyLastUpdate = (spotify_show_id) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT spotify_show_id, MAX(release_date)
                     FROM spotify_episodes
                     WHERE spotify_show_id = $1
                     GROUP BY spotify_show_id`;
            let result = yield this.db.oneOrNone(query, [spotify_show_id]);
            if (result === null)
                return new Date("1/1/2018");
            return result.max;
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
                           WHERE ${idType} IN ($1)
                             AND platform = $2
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
                        claims: response[i].expiration,
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
                { name: 'updated_at', prop: 'updatedAt' },
                { name: 'claims', prop: 'claims' },
            ], { table: 'data_platform_claim' });
            const query = this.pgp.helpers.insert(userTokens, cs) + ` ON CONFLICT ON CONSTRAINT platform_platform_user_id_key DO UPDATE SET
                                                                    access_token = EXCLUDED.access_token,
                                                                    refresh_token = EXCLUDED.refresh_token,
                                                                    expiration = EXCLUDED.expiration,
                                                                    updated_at = EXCLUDED.updated_at
                                                                    `;
            console.log(query);
            return yield this.db.result(query);
        });
        this.removeUserToken = (idType, id, platform) => __awaiter(this, void 0, void 0, function* () {
            try {
                const query = `DELETE
                           FROM data_platform_claim
                           WHERE ${idType} IN ($1)
                             AND platform = $2
            `;
                yield this.db.none(query, [id, platform]);
            }
            catch (error) {
                throw new Error(`Failed to delete Youtube claim for id: ${id}`);
            }
        });
        this.isUserIdDummy = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT dummy
                       FROM data_user
                       WHERE id = $1`;
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
                yield this.db.tx((t) => __awaiter(this, void 0, void 0, function* () {
                    let updateQueries = [];
                    for (let d of tableResponse) {
                        updateQueries.push(this.db.oneOrNone(`UPDATE ${d.table_from}
                                                          SET user_id = '${userId.newUserId}'
                                                          WHERE user_id = '${userId.dummyUserId}'
                    `));
                    }
                    updateQueries.push(this.db.none(`DELETE
                                                 FROM data_user
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
        this.getTweetsAndUsersById = (lastId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT t.id                  AS id,
                            t.tweet_id            AS tweet_id,
                            t.twitter_user_id,
                            t.embed,
                            t.lang,
                            t.like_count,
                            t.possibly_sensitive,
                            t.quote_count,
                            t.reply_count,
                            t.retweet_count,
                            t.text,
                            t.tweet_url,
                            t.urls,
                            t.media_keys,
                            t.annotations,
                            t.cashtags,
                            t.hashtags,
                            t.mentions,
                            t.twitter_created_at  AS tweet_twitter_created_at,
                            t.created_at          AS trading_post_tweet_created_at,
                            tu.username           AS twitter_username,
                            tu.display_name,
                            tu.description,
                            tu.location,
                            tu.follower_count,
                            tu.following_count,
                            tu.profile_image_url,
                            tu.profile_url,
                            tu.protected,
                            tu.twitter_created_at AS user_twitter_created_at,
                            tu.created_at         AS trading_post_twitter_created_at,
                            t.max_width           AS max_width,
                            t.aspect_ratio        AS aspect_ratio,
                            du.id                 AS trading_post_user_id,
                            du.handle             AS trading_post_user_handle,
                            du.email              AS trading_post_user_email,
                            du.profile_url        AS trading_post_user_profile_url
                     FROM tweets t
                              INNER JOIN
                          twitter_users tu
                          ON
                              tu.twitter_user_id = t.twitter_user_id
                              INNER JOIN
                          DATA_PLATFORM_CLAIM dpc ON
                              dpc.PLATFORM_USER_ID = t.TWITTER_USER_ID
                              INNER JOIN
                          data_user du ON
                              dpc.user_id = du.ID
                     WHERE t.id > $1
                       AND t.aspect_ratio != 0
                       AND t.aspect_ratio IS NOT NULL
                     ORDER BY t.id
                     LIMIT 5000;`;
            const response = yield this.db.query(query, [lastId]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    id: row.id,
                    created_at: luxon_1.DateTime.fromJSDate(row.trading_post_tweet_created_at),
                    annotations: row.annotations,
                    cashtags: row.cashtags,
                    description: row.description,
                    twitterUsername: row.twitter_username,
                    displayName: row.display_name,
                    embed: row.embed,
                    followerCount: row.follower_count,
                    followingCount: row.follower_count,
                    hashtags: row.hashtags,
                    language: row.lang,
                    likeCount: row.like_count,
                    location: row.location,
                    mediaKeys: row.media_keys,
                    mentions: row.mentions,
                    possiblySensitive: row.possibly_sensitive,
                    profileImageURL: row.profile_image_url,
                    profileURL: row.profile_url,
                    protected: row.protected,
                    quoteCount: row.quote_count,
                    replyCount: row.reply_count,
                    retweetCount: row.retweet_count,
                    text: row.text,
                    tradingPostTweetCreatedAt: luxon_1.DateTime.fromJSDate(row.trading_post_tweet_created_at),
                    tradingPostTwitterCreatedAt: luxon_1.DateTime.fromJSDate(row.trading_post_twitter_created_at),
                    tweetID: row.tweet_id,
                    tweetTwitterCreatedAt: luxon_1.DateTime.fromJSDate(row.tweet_twitter_created_at),
                    tweetURL: row.tweet_url,
                    twitterUserID: row.twitter_user_id,
                    URLs: row.urls,
                    userTwitterCreatedAt: luxon_1.DateTime.fromJSDate(row.user_twitter_created_at),
                    aspectRatio: 400 / row.aspect_ratio,
                    maxWidth: row.max_width,
                    tradingpostUserId: row.trading_post_user_id,
                    tradingpostUserEmail: row.trading_post_user_email,
                    tradingpostUserHandle: row.trading_post_user_handle,
                    tradingpostUserProfileUrl: row.trading_post_user_profile_url,
                };
                return obj;
            });
        });
        this.getTweetsAndUsersByTweetIds = (tweetIds) => __awaiter(this, void 0, void 0, function* () {
            if (tweetIds.length <= 0)
                return [];
            let query = `SELECT t.id                  AS id,
                            t.tweet_id            AS tweet_id,
                            t.twitter_user_id,
                            t.embed,
                            t.lang,
                            t.like_count,
                            t.possibly_sensitive,
                            t.quote_count,
                            t.reply_count,
                            t.retweet_count,
                            t.text,
                            t.tweet_url,
                            t.urls,
                            t.media_keys,
                            t.annotations,
                            t.cashtags,
                            t.hashtags,
                            t.mentions,
                            t.twitter_created_at  AS tweet_twitter_created_at,
                            t.created_at          AS trading_post_tweet_created_at,
                            tu.username           AS twitter_username,
                            tu.display_name,
                            tu.description,
                            tu.location,
                            tu.follower_count,
                            tu.following_count,
                            tu.profile_image_url,
                            tu.profile_url,
                            tu.protected,
                            tu.twitter_created_at AS user_twitter_created_at,
                            tu.created_at         AS trading_post_twitter_created_at,
                            t.max_width           AS max_width,
                            t.aspect_ratio        AS aspect_ratio,
                            du.id                 AS trading_post_user_id,
                            du.handle             AS trading_post_user_handle,
                            du.email              AS trading_post_user_email,
                            du.profile_url        AS trading_post_user_profile_url
                     FROM tweets t
                              INNER JOIN
                          twitter_users tu
                          ON
                              tu.twitter_user_id = t.twitter_user_id
                              INNER JOIN
                          DATA_PLATFORM_CLAIM dpc ON
                              dpc.PLATFORM_USER_ID = t.TWITTER_USER_ID
                              INNER JOIN
                          data_user du ON
                              dpc.user_id = du.ID
                     WHERE t.tweet_id IN ($1:list)
                       AND t.aspect_ratio != 0
                       AND t.aspect_ratio IS NOT NULL
                     ORDER BY t.id
                     LIMIT 5000;`;
            const response = yield this.db.query(query, [tweetIds]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    annotations: row.annotations,
                    cashtags: row.cashtags,
                    description: row.description,
                    twitterUsername: row.twitter_username,
                    displayName: row.display_name,
                    embed: row.embed,
                    followerCount: row.follower_count,
                    followingCount: row.follower_count,
                    hashtags: row.hashtags,
                    language: row.lang,
                    likeCount: row.like_count,
                    location: row.location,
                    mediaKeys: row.media_keys,
                    mentions: row.mentions,
                    possiblySensitive: row.possibly_sensitive,
                    profileImageURL: row.profile_image_url,
                    profileURL: row.profile_url,
                    protected: row.protected,
                    quoteCount: row.quote_count,
                    replyCount: row.reply_count,
                    retweetCount: row.retweet_count,
                    text: row.text,
                    tradingPostTweetCreatedAt: luxon_1.DateTime.fromJSDate(row.trading_post_tweet_created_at),
                    tradingPostTwitterCreatedAt: luxon_1.DateTime.fromJSDate(row.trading_post_twitter_created_at),
                    tweetID: row.tweet_id,
                    tweetTwitterCreatedAt: luxon_1.DateTime.fromJSDate(row.tweet_twitter_created_at),
                    tweetURL: row.tweet_url,
                    twitterUserID: row.twitter_user_id,
                    URLs: row.urls,
                    userTwitterCreatedAt: luxon_1.DateTime.fromJSDate(row.user_twitter_created_at),
                    aspectRatio: 400 / row.aspect_ratio,
                    maxWidth: row.max_width,
                    tradingpostUserId: row.trading_post_user_id,
                    tradingpostUserEmail: row.trading_post_user_email,
                    tradingpostUserHandle: row.trading_post_user_handle,
                    tradingpostUserProfileUrl: row.trading_post_user_profile_url,
                };
                return obj;
            });
        });
        this.upsertTweets = (formatedTweets) => __awaiter(this, void 0, void 0, function* () {
            if (formatedTweets.length <= 0)
                return 0;
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
                    { name: 'twitter_created_at', prop: 'twitter_created_at' },
                    { name: 'aspect_ratio', prop: 'aspect_ratio' },
                    { name: 'max_width', prop: 'max_width' }
                ], { table: 'tweets' });
                const query = this.pgp.helpers.insert(formatedTweets, cs) + ` ON CONFLICT ON CONSTRAINT tweets_tweet_id_key DO UPDATE SET
                                                                            like_count = EXCLUDED.like_count,
                                                                            quote_count = EXCLUDED.quote_count,
                                                                            reply_count = EXCLUDED.reply_count,
                                                                            retweet_count = EXCLUDED.retweet_count,
                                                                            aspect_ratio = EXCLUDED.aspect_ratio,
                                                                            max_width = EXCLUDED.max_width`;
                const result = yield this.db.result(query);
                return result.rowCount;
            }
            catch (err) {
                console.error(err);
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
                    { name: 'aspect_ratio', prop: 'aspect_ratio' },
                    { name: 'max_width', prop: 'max_width' }
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
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
        this.getEpisodesAndUsersByEpisodeIds = (episodeIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT se.id                   AS id,
                   se.spotify_episode_id,
                   se.spotify_show_id,
                   se.audio_preview_url,
                   se.name                 AS episode_name,
                   se.description          AS episode_description,
                   se.duration_ms          AS episode_duration_ms,
                   se.explicit             AS is_episode_explicit,
                   se.html_description     AS episode_html_description,
                   se.is_externally_hosted AS is_episode_externally_hosted,
                   se.is_playable          AS is_episode_playable,
                   se.language             AS episode_language,
                   se.languages            AS episode_languages,
                   se.embed                AS episode_embed,
                   se.external_urls        AS episode_external_urls,
                   se.images               AS episode_images,
                   se.release_date         AS episode_release_date,
                   se.created_at           AS tradingpost_episode_created_at,
                   dpc.user_id             AS tradingpost_user_id,
                   su.name                 AS podcast_name,
                   su.description          AS podcast_description,
                   su.explicit             AS is_podcast_explicit,
                   su.html_description     AS podcast_html_description,
                   su.is_externally_hosted AS is_podcast_externally_hosted,
                   su.media_type           AS podcast_media_type,
                   su.publisher            AS podcast_publisher,
                   su.total_episodes       AS podcast_total_episodes,
                   su.languages            AS podcast_languages,
                   su.external_urls        AS podcast_external_urls,
                   su.images               AS podcast_images,
                   su.copyrights           AS podcast_copyrights,
                   su.created_at           AS tradingpost_podcast_created_at,
                   se.max_width            AS max_width,
                   se.aspect_ratio         AS aspect_ratio,
                   du.id                   AS tradingpost_user_id,
                   du.handle               AS tradingpost_user_handle,
                   du.email                AS tradingpost_user_email,
                   du.profile_url          AS tradingpost_user_profile_url
            FROM spotify_episodes se
                     INNER JOIN
                 spotify_users su
                 ON
                     su.spotify_show_id = se.spotify_show_id
                     INNER JOIN
                 DATA_PLATFORM_CLAIM dpc
                 ON
                     dpc.PLATFORM_USER_ID = su.SPOTIFY_SHOW_ID
                     INNER JOIN data_user du
                                ON
                                    dpc.user_id = du.id
            WHERE se.spotify_episode_id IN ($1:list)
              AND se.aspect_ratio != 0
              AND se.aspect_ratio IS NOT NULL`;
            const response = yield this.db.query(query, [episodeIds]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    audio_preview_url: row.audio_preview_url,
                    episode_description: row.episode_description,
                    episode_duration_ms: row.episode_duration_ms,
                    episode_embed: row.episode_embed,
                    episode_external_urls: row.episode_external_urls,
                    episode_html_description: row.episode_html_description,
                    episode_images: row.episode_images,
                    episode_language: row.episode_language,
                    episode_languages: row.episode_languages,
                    episode_name: row.episode_name,
                    episode_release_date: luxon_1.DateTime.fromJSDate(row.episode_release_date),
                    is_episode_explicit: row.is_episode_explicit,
                    is_episode_externally_hosted: row.is_episode_externally_hosted,
                    is_episode_playable: row.is_episode_playable,
                    is_podcast_explicit: row.is_podcast_explicit,
                    is_podcast_externally_hosted: row.is_podcast_externally_hosted,
                    podcast_copyrights: row.podcast_copyrights,
                    podcast_description: row.podcast_description,
                    podcast_external_urls: row.podcast_external_urls,
                    podcast_html_description: row.podcast_html_description,
                    podcast_images: row.podcast_images,
                    podcast_languages: row.podcast_languages,
                    podcast_media_type: row.podcast_media_type,
                    podcast_name: row.podcast_name,
                    podcast_publisher: row.podcast_publisher,
                    podcast_total_episodes: row.podcast_total_episodes,
                    spotify_episode_id: row.spotify_episode_id,
                    spotify_show_id: row.spotify_show_id,
                    tradingpost_episode_created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_episode_created_at),
                    tradingpost_podcast_created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_podcast_created_at),
                    aspectRatio: row.aspect_ratio,
                    maxWidth: row.max_width,
                    tradingpostUserId: row.tradingpost_user_id,
                    tradingpostUserProfileUrl: row.tradingpost_user_profile_url,
                    tradingpostUserEmail: row.tradingpost_user_email,
                    tradingpostUserHandle: row.tradingpost_user_handle
                };
                return obj;
            });
        });
        this.getEpisodesAndUsersById = (id) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT se.id                   AS id,
                            se.spotify_episode_id,
                            se.spotify_show_id,
                            se.audio_preview_url,
                            se.name                 AS episode_name,
                            se.description          AS episode_description,
                            se.duration_ms          AS episode_duration_ms,
                            se.explicit             AS is_episode_explicit,
                            se.html_description     AS episode_html_description,
                            se.is_externally_hosted AS is_episode_externally_hosted,
                            se.is_playable          AS is_episode_playable,
                            se.language             AS episode_language,
                            se.languages            AS episode_languages,
                            se.embed                AS episode_embed,
                            se.external_urls        AS episode_external_urls,
                            se.images               AS episode_images,
                            se.release_date         AS episode_release_date,
                            se.created_at           AS tradingpost_episode_created_at,
                            dpc.user_id             AS tradingpost_user_id,
                            su.name                 AS podcast_name,
                            su.description          AS podcast_description,
                            su.explicit             AS is_podcast_explicit,
                            su.html_description     AS podcast_html_description,
                            su.is_externally_hosted AS is_podcast_externally_hosted,
                            su.media_type           AS podcast_media_type,
                            su.publisher            AS podcast_publisher,
                            su.total_episodes       AS podcast_total_episodes,
                            su.languages            AS podcast_languages,
                            su.external_urls        AS podcast_external_urls,
                            su.images               AS podcast_images,
                            su.copyrights           AS podcast_copyrights,
                            su.created_at           AS tradingpost_podcast_created_at,
                            se.max_width            AS max_width,
                            se.aspect_ratio         AS aspect_ratio,
                            du.id                   AS tradingpost_user_id,
                            du.handle               AS tradingpost_user_handle,
                            du.email                AS tradingpost_user_email,
                            du.profile_url          AS tradingpost_user_profile_url
                     FROM spotify_episodes se
                              INNER JOIN
                          spotify_users su
                          ON
                              su.spotify_show_id = se.spotify_show_id
                              INNER JOIN
                          DATA_PLATFORM_CLAIM dpc
                          ON
                              dpc.PLATFORM_USER_ID = su.SPOTIFY_SHOW_ID
                              INNER JOIN data_user du
                                         ON
                                             dpc.user_id = du.id
                     WHERE se.id > $1
                       AND se.aspect_ratio != 0
                       AND se.aspect_ratio IS NOT NULL
                     ORDER BY se.id
                     LIMIT 5000;`;
            const response = yield this.db.query(query, [id]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    id: row.id,
                    created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_episode_created_at),
                    audio_preview_url: row.audio_preview_url,
                    episode_description: row.episode_description,
                    episode_duration_ms: row.episode_duration_ms,
                    episode_embed: row.episode_embed,
                    episode_external_urls: row.episode_external_urls,
                    episode_html_description: row.episode_html_description,
                    episode_images: row.episode_images,
                    episode_language: row.episode_language,
                    episode_languages: row.episode_languages,
                    episode_name: row.episode_name,
                    episode_release_date: luxon_1.DateTime.fromJSDate(row.episode_release_date),
                    is_episode_explicit: row.is_episode_explicit,
                    is_episode_externally_hosted: row.is_episode_externally_hosted,
                    is_episode_playable: row.is_episode_playable,
                    is_podcast_explicit: row.is_podcast_explicit,
                    is_podcast_externally_hosted: row.is_podcast_externally_hosted,
                    podcast_copyrights: row.podcast_copyrights,
                    podcast_description: row.podcast_description,
                    podcast_external_urls: row.podcast_external_urls,
                    podcast_html_description: row.podcast_html_description,
                    podcast_images: row.podcast_images,
                    podcast_languages: row.podcast_languages,
                    podcast_media_type: row.podcast_media_type,
                    podcast_name: row.podcast_name,
                    podcast_publisher: row.podcast_publisher,
                    podcast_total_episodes: row.podcast_total_episodes,
                    spotify_episode_id: row.spotify_episode_id,
                    spotify_show_id: row.spotify_show_id,
                    tradingpost_episode_created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_episode_created_at),
                    tradingpost_podcast_created_at: luxon_1.DateTime.fromJSDate(row.tradingpost_podcast_created_at),
                    aspectRatio: row.aspect_ratio,
                    maxWidth: row.max_width,
                    tradingpostUserId: row.tradingpost_user_id,
                    tradingpostUserProfileUrl: row.tradingpost_user_profile_url,
                    tradingpostUserEmail: row.tradingpost_user_email,
                    tradingpostUserHandle: row.tradingpost_user_handle
                };
                return obj;
            });
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
                    { name: 'aspect_ratio', prop: 'aspect_ratio' },
                    { name: 'max_width', prop: 'max_width' }
                ], { table: 'spotify_episodes' });
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                const query = this.pgp.helpers.insert(episodes, cs) + ` ON CONFLICT ON CONSTRAINT spotify_episodes_spotify_episode_id_key  DO UPDATE SET
                                                                        embed = EXCLUDED.embed`;
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
                                                                          images = EXCLUDED.images
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
        this.getYoutubeVideosAndChannelsByVideoIds = (videoIds) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT yv.id                 AS id,
                            yv.video_id,
                            yv.youtube_channel_id,
                            dpc.USER_ID           AS tradingpost_user_id,
                            yv.title,
                            yv.description,
                            yv.video_url,
                            yv.video_embed,
                            yv.thumbnails,
                            yv.youtube_created_at,
                            yv.created_at         AS trading_post_youtube_video_created_at,
                            yu.title              AS channel_title,
                            yu.description        AS channel_description,
                            yu.country,
                            yu.custom_url         AS custom_channel_url,
                            yu.thumbnails         AS channel_thumbails,
                            yu.statistics         AS channel_statistics,
                            yu.status             AS channel_status,
                            yu.youtube_created_at AS channel_created_at,
                            yu.created_at         AS trading_post_channel_created_at,
                            yv.max_width          as max_width,
                            yv.aspect_ratio       as aspect_ratio,
                            du.id                 AS tradingpost_user_id,
                            du.handle             AS tradingpost_user_handle,
                            du.email              AS tradingpost_user_email,
                            du.profile_url        AS tradingpost_user_profile_url
                     FROM youtube_videos yv
                              INNER JOIN
                          youtube_users yu
                          ON
                              yu.youtube_channel_id = yv.youtube_channel_id
                              INNER JOIN DATA_PLATFORM_CLAIM dpc
                                         ON
                                             yu.YOUTUBE_CHANNEL_ID = dpc.PLATFORM_USER_ID
                              INNER JOIN data_user du
                                         ON dpc.user_id = du.id
                     WHERE yv.video_id IN ($1:list)
                       AND yv.aspect_ratio != 0
                       AND yv.aspect_ratio IS NOT NULL
                     ORDER BY yv.id
                     LIMIT 5000;`;
            const response = yield this.db.query(query, [videoIds]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    channel_created_at: row.channel_created_at,
                    channel_description: row.channel_description,
                    channel_statistics: row.channel_statistics,
                    channel_status: row.channel_status,
                    channel_thumbnails: row.channel_thumbnails,
                    channel_title: row.channel_title,
                    country: row.country,
                    custom_channel_url: row.custom_channel_url,
                    description: row.description,
                    thumbnails: row.thumbnails,
                    title: row.title,
                    trading_post_channel_created_at: luxon_1.DateTime.fromJSDate(row.trading_post_channel_created_at),
                    trading_post_youtube_video_created_at: luxon_1.DateTime.fromJSDate(row.trading_post_youtube_video_created_at),
                    video_embed: row.video_embed,
                    video_id: row.video_id,
                    video_url: row.video_url,
                    youtube_channel_id: row.youtube_channel_id,
                    youtube_created_at: luxon_1.DateTime.fromJSDate(row.youtube_created_at),
                    maxWidth: row.max_width,
                    aspectRatio: row.aspect_ratio,
                    tradingpostUserId: row.tradingpost_user_id,
                    tradingpostUserEmail: row.tradingpost_user_email,
                    tradingpostUserHandle: row.tradingpost_user_handle,
                    tradingpostUserProfileUrl: row.tradingpost_user_profile_url
                };
                return obj;
            });
        });
        this.getYoutubeVideosAndChannelsById = (lastId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT yv.id                 AS id,
                            yv.video_id,
                            yv.youtube_channel_id,
                            dpc.USER_ID           AS tradingpost_user_id,
                            yv.title,
                            yv.description,
                            yv.video_url,
                            yv.video_embed,
                            yv.thumbnails,
                            yv.youtube_created_at,
                            yv.created_at         AS trading_post_youtube_video_created_at,
                            yu.title              AS channel_title,
                            yu.description        AS channel_description,
                            yu.country,
                            yu.custom_url         AS custom_channel_url,
                            yu.thumbnails         AS channel_thumbails,
                            yu.statistics         AS channel_statistics,
                            yu.status             AS channel_status,
                            yu.youtube_created_at AS channel_created_at,
                            yu.created_at         AS trading_post_channel_created_at,
                            yv.max_width          as max_width,
                            yv.aspect_ratio       as aspect_ratio,
                            du.id                 AS tradingpost_user_id,
                            du.handle             AS tradingpost_user_handle,
                            du.email              AS tradingpost_user_email,
                            du.profile_url        AS tradingpost_user_profile_url
                     FROM youtube_videos yv
                              INNER JOIN
                          youtube_users yu
                          ON
                              yu.youtube_channel_id = yv.youtube_channel_id
                              INNER JOIN DATA_PLATFORM_CLAIM dpc
                                         ON
                                             yu.YOUTUBE_CHANNEL_ID = dpc.PLATFORM_USER_ID
                              INNER JOIN data_user du
                                         ON dpc.user_id = du.id
                     WHERE yv.id > $1
                       AND yv.aspect_ratio != 0
                       AND yv.aspect_ratio IS NOT NULL
                     ORDER BY yv.id
                     LIMIT 5000;`;
            const response = yield this.db.query(query, [lastId]);
            if (response.length <= 0)
                return [];
            return response.map((row) => {
                let obj = {
                    id: row.id,
                    created_at: luxon_1.DateTime.fromJSDate(row.trading_post_youtube_video_created_at),
                    channel_created_at: row.channel_created_at,
                    channel_description: row.channel_description,
                    channel_statistics: row.channel_statistics,
                    channel_status: row.channel_status,
                    channel_thumbnails: row.channel_thumbnails,
                    channel_title: row.channel_title,
                    country: row.country,
                    custom_channel_url: row.custom_channel_url,
                    description: row.description,
                    thumbnails: row.thumbnails,
                    title: row.title,
                    trading_post_channel_created_at: luxon_1.DateTime.fromJSDate(row.trading_post_channel_created_at),
                    trading_post_youtube_video_created_at: luxon_1.DateTime.fromJSDate(row.trading_post_youtube_video_created_at),
                    video_embed: row.video_embed,
                    video_id: row.video_id,
                    video_url: row.video_url,
                    youtube_channel_id: row.youtube_channel_id,
                    youtube_created_at: luxon_1.DateTime.fromJSDate(row.youtube_created_at),
                    maxWidth: row.max_width,
                    aspectRatio: row.aspect_ratio,
                    tradingpostUserId: row.tradingpost_user_id,
                    tradingpostUserEmail: row.tradingpost_user_email,
                    tradingpostUserHandle: row.tradingpost_user_handle,
                    tradingpostUserProfileUrl: row.tradingpost_user_profile_url
                };
                return obj;
            });
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
                    { name: 'aspect_ratio', prop: 'aspect_ratio' },
                    { name: 'max_width', prop: 'max_width' }
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
        this.getTradingPostsAndUsers = (lastId) => __awaiter(this, void 0, void 0, function* () {
            try {
                let query = `SELECT dp.id,
                                dp.user_id,
                                dp.subscription_level,
                                dp.title,
                                dp.body,
                                dp.created_at,
                                dp.updated_at,
                                (dp.max_width::numeric(24, 4))    AS max_width,
                                (dp.aspect_ratio::numeric(24, 4)) AS aspect_ratio,
                                du.handle                         AS tradingpost_user_handle,
                                du.email                          AS tradingpost_user_email,
                                du.profile_url                    AS tradingpost_user_profile_url
                         FROM data_post dp
                                  INNER JOIN data_user du
                                             ON dp.user_id = du.id
                         WHERE dp.id > $1
                         ORDER BY dp.id;
            `;
                const response = yield this.db.query(query, [lastId]);
                if (response.length <= 0)
                    return [];
                return response.map((row) => {
                    let o = {
                        id: row.id,
                        user_id: row.user_id,
                        subscription_level: row.subscription_level,
                        title: row.title,
                        body: row.body,
                        tradingpost_user_handle: row.handle,
                        tradingpost_user_email: row.email,
                        aspect_ratio: row.aspect_ratio,
                        max_width: row.max_width,
                        tradingpost_user_profile_url: row.tradingpost_user_profile_url,
                        created_at: luxon_1.DateTime.fromJSDate(row.created_at),
                        updated_at: luxon_1.DateTime.fromJSDate(row.updated_at)
                    };
                    console.log();
                    return o;
                });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBK0I7QUFjL0IsTUFBcUIsVUFBVTtJQUkzQixZQUFZLEVBQWtCLEVBQUUsR0FBVTtRQUsxQyxvQkFBZSxHQUFHLEdBQWlELEVBQUU7WUFDakUsSUFBSSxLQUFLLEdBQUc7d0NBQ29CLENBQUM7WUFFakMsT0FBTyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQSxDQUFBO1FBRUQsb0JBQWUsR0FBRyxHQUE0RyxFQUFFO1lBQzVILElBQUksS0FBSyxHQUFHOzs7OzsrRkFLMkUsQ0FBQztZQUV4RixPQUFPLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFBLENBQUE7UUFFRCxxQkFBZ0IsR0FBRyxHQUFrRCxFQUFFO1lBQ25FLElBQUksS0FBSyxHQUFHO3lDQUNxQixDQUFDO1lBQ2xDLE9BQU8sTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUEsQ0FBQTtRQUVELDRDQUF1QyxHQUFHLENBQU8sVUFBb0IsRUFBb0MsRUFBRTtZQUN2RyxJQUFJLEtBQUssR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQ0F3Q2lCLENBQUE7WUFDN0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3BDLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdB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