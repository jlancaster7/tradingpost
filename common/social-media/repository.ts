import {DateTime} from "luxon";
import {formatedTweet, formatedTwitterUser, TweetsAndUsers, TweetsAndUsersTable} from './twitter/interfaces';
import {PlatformToken} from './utils';
import {SubstackAndNewsletter, SubstackAndNewsletterTable, SubstackArticles, SubstackUser} from './substack/interfaces';
import {spotifyShow, spotifyEpisode, SpotifyEpisodeAndUser, SpotifyEpisodeAndUserTable} from './spotify/interfaces';
import { TradingPostsAndUsers, TradingPostsAndUsersTable } from "./tradingposts/interfaces";
import {
    formatedYoutubeVideo,
    formatedChannelInfo,
    YouTubeVideoAndChannel,
    YouTubeVideoAndChannelTable
} from './youtube/interfaces';
import {IDatabase, IMain} from "pg-promise";

export default class Repository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    getSpotifyUsers = async (): Promise<{ spotify_show_id: string }[]> => {
        let query = `SELECT spotify_show_id
                     FROM spotify_users`;

        return await this.db.query(query);
    }

    getTwitterUsers = async (): Promise<{ twitter_user_id: string, access_token: string | null, refresh_token: string | null }[]> => {
        let query = `SELECT twitter_user_id, a.access_token, a.refresh_token
                     FROM twitter_users
                              LEFT JOIN (SELECT platform_user_id, access_token, refresh_token
                                         FROM data_platform_claim
                                         WHERE platform = 'twitter') as a
                                        ON twitter_users.twitter_user_id = a.platform_user_id;`;

        return await this.db.query(query);
    }

    getSubstackUsers = async (): Promise<{ substack_user_id: string }[]> => {
        let query = `SELECT substack_user_id
                     FROM substack_users`;
        return await this.db.query(query);
    }

    getSubstackArticlesAndUsersByArticleIds = async (articleIds: string[]): Promise<SubstackAndNewsletter[]> => {
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
                     ORDER BY sa.id;`
        const response = await this.db.query(query, [articleIds]);
        if (response.length <= 0) return [];
        return response.map((row: any) => {
            let obj: SubstackAndNewsletter = {
                article_id: row.article_id,
                content: row.content,
                content_encoded: row.content_encoded,
                content_encoded_snippet: row.content_encoded_snippet,
                content_snippet: row.content_snippet,
                creator: row.creator,
                dc_creator: row.dc_creator,
                enclosure: row.enclosure,
                itunes: row.itunes,
                last_newsletter_build_date: DateTime.fromJSDate(row.last_newsletter_build_date),
                link: row.link,
                newsletter_description: row.newsletter_description,
                newsletter_email: row.newsletter_email,
                newsletter_image: row.newsletter_image,
                newsletter_itunes: row.newsletter_itunes,
                newsletter_language: row.newsletter_language,
                newsletter_link: row.newsletter_link,
                newsletter_title: row.newsletter_title,
                substack_added_to_tradingpost_date: DateTime.fromJSDate(row.substack_added_to_tradingpost_date),
                substack_article_created_at: DateTime.fromJSDate(row.substack_article_created_at),
                substack_user_id: row.substack_user_id,
                title: row.title,
                tradingpost_substack_article_created_at: DateTime.fromJSDate(row.tradingpost_substack_article_created_at),
                aspectRatio: 400 / (row.aspect_ratio as number),
                maxWidth: row.max_width,
                tradingpostUserId: row.tradingpost_user_id,
                tradingpostUserHandle: row.tradingpost_user_handle,
                tradingpostUserEmail: row.tradingpost_user_email,
                tradingpostProfileUrl: row.tradingpost_profile_url
            }
            return obj;
        });
    }

    getSubstackArticlesAndUsers = async (lastId: number): Promise<SubstackAndNewsletterTable[]> => {
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
                     ORDER BY sa.id;`
        const response = await this.db.query(query, [lastId]);
        if (response.length <= 0) return [];
        return response.map((row: any) => {
            let obj: SubstackAndNewsletterTable = {
                id: row.id,
                created_at: DateTime.fromJSDate(row.tradingpost_substack_article_created_at),
                article_id: row.article_id,
                content: row.content,
                content_encoded: row.content_encoded,
                content_encoded_snippet: row.content_encoded_snippet,
                content_snippet: row.content_snippet,
                creator: row.creator,
                dc_creator: row.dc_creator,
                enclosure: row.enclosure,
                itunes: row.itunes,
                last_newsletter_build_date: DateTime.fromJSDate(row.last_newsletter_build_date),
                link: row.link,
                newsletter_description: row.newsletter_description,
                newsletter_email: row.newsletter_email,
                newsletter_image: row.newsletter_image,
                newsletter_itunes: row.newsletter_itunes,
                newsletter_language: row.newsletter_language,
                newsletter_link: row.newsletter_link,
                newsletter_title: row.newsletter_title,
                substack_added_to_tradingpost_date: DateTime.fromJSDate(row.substack_added_to_tradingpost_date),
                substack_article_created_at: DateTime.fromJSDate(row.substack_article_created_at),
                substack_user_id: row.substack_user_id,
                title: row.title,
                tradingpost_substack_article_created_at: DateTime.fromJSDate(row.tradingpost_substack_article_created_at),
                aspectRatio: 400 / (row.aspect_ratio as number),
                maxWidth: row.max_width,
                tradingpostUserId: row.tradingpost_user_id,
                tradingpostUserHandle: row.tradingpost_user_handle,
                tradingpostUserEmail: row.tradingpost_user_email,
                tradingpostProfileUrl: row.tradingpost_profile_url
            }
            return obj;
        });
    }

    getYoutubeUsers = async (): Promise<{ youtube_channel_id: string, access_token: string | null, refresh_token: string | null }[]> => {
        let query = `SELECT a.youtube_channel_id, b.access_token, b.refresh_token
                     FROM youtube_users as a
                              LEFT JOIN (SELECT platform_user_id, access_token, refresh_token
                                         FROM data_platform_claim
                                         WHERE platform = 'youtube') as b
                                        ON a.youtube_channel_id = b.platform_user_id`;

        return await this.db.query(query);
    }

    getTweetsLastUpdate = async (twitterUserId: string): Promise<Date> => {
        let query = `SELECT twitter_user_id, MAX(created_at)
                     FROM tweets
                     WHERE twitter_user_id = $1
                     GROUP BY twitter_user_id`;
        let result = await this.db.result(query, [twitterUserId]);

        if (!result.rows.length) {
            let defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() - 90);
            return defaultDate;
        } else {
            // @ts-ignore
            return result.rows[0].max
        }
    }

    getYoutubeLastUpdate = async (youtubeChannelId: string): Promise<Date> => {
        let query = `SELECT youtube_channel_id, MAX(created_at)
                     FROM youtube_videos
                     WHERE youtube_channel_id = $1
                     GROUP BY youtube_channel_id`;
        let result = await this.db.result(query, [youtubeChannelId]);

        if (!result.rows.length) {
            return new Date('1/1/2018');
        } else {
            // @ts-ignore
            return result.rows[0].max;
        }
    }

    getSpotifyLastUpdate = async (spotify_show_id: string): Promise<Date> => {
        let query = `SELECT spotify_show_id, MAX(release_date)
                     FROM spotify_episodes
                     WHERE spotify_show_id = $1
                     GROUP BY spotify_show_id`;
        let result = await this.db.result(query, [spotify_show_id]);

        if (!result.rows.length) {
            return new Date('1/1/2018');
        } else {
            // @ts-ignore
            return result.rows[0].max;
        }
    }

    getTokens = async (idType: string, ids: string[], platform: string): Promise<PlatformToken[]> => {
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
            const response = await this.db.many(query, [ids.join(', '), platform]);
            let result: PlatformToken[] = [];
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
                })
            }
            return result;
        } catch (error) {
            return []
        }

    }

    upsertUserTokens = async (userTokens: PlatformToken) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'platform', prop: 'platform'},
            {name: 'platform_user_id', prop: 'platformUserId'},
            {name: 'access_token', prop: 'accessToken'},
            {name: 'refresh_token', prop: 'refreshToken'},
            {name: 'expiration', prop: 'expiration'},
            {name: 'updated_at', prop: 'updatedAt'},
            {name: 'claims', prop: 'claims'},
        ], {table: 'data_platform_claim'})
        const query = this.pgp.helpers.insert(userTokens, cs) + ` ON CONFLICT ON CONSTRAINT platform_platform_user_id_key DO UPDATE SET
                                                                    access_token = EXCLUDED.access_token,
                                                                    refresh_token = EXCLUDED.refresh_token,
                                                                    expiration = EXCLUDED.expiration,
                                                                    updated_at = EXCLUDED.updated_at
                                                                    `;
        console.log(query);
        return await this.db.result(query);
    }

    removeUserToken = async (idType: string, id: string, platform: string) => {
        try {
            const query = `DELETE
                           FROM data_platform_claim
                           WHERE ${idType} IN ($1)
                             AND platform = $2
            `;
            await this.db.none(query, [id, platform]);
        } catch (error) {
            throw new Error(`Failed to delete Youtube claim for id: ${id}`);
        }
    }

    isUserIdDummy = async (userId: string): Promise<boolean> => {
        const query = `SELECT dummy
                       FROM data_user
                       WHERE id = $1`
        return (await this.db.one(query, [userId])).dummy;
    }

    mergeDummyAccounts = async (userId: { newUserId: string, dummyUserId: string }) => {
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
            const tableResponse = await this.db.query(tableQuery);
            await this.db.tx(async t => {
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
            })
        } catch (err) {
            console.error(err);
            throw new Error(`Merge for newUserId: ${userId.newUserId} dummyUserId: ${userId.dummyUserId} failed`)
        }
    }

    getTweetsAndUsersById = async (lastId: number): Promise<TweetsAndUsersTable[]> => {
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
                     LIMIT 5000;`
        const response = await this.db.query(query, [lastId]);

        if (response.length <= 0) return [];

        return response.map((row: any) => {
            let obj: TweetsAndUsersTable = {
                id: row.id,
                created_at: DateTime.fromJSDate(row.trading_post_tweet_created_at),
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
                tradingPostTweetCreatedAt: DateTime.fromJSDate(row.trading_post_tweet_created_at),
                tradingPostTwitterCreatedAt: DateTime.fromJSDate(row.trading_post_twitter_created_at),
                tweetID: row.tweet_id,
                tweetTwitterCreatedAt: DateTime.fromJSDate(row.tweet_twitter_created_at),
                tweetURL: row.tweet_url,
                twitterUserID: row.twitter_user_id,
                URLs: row.urls,
                userTwitterCreatedAt: DateTime.fromJSDate(row.user_twitter_created_at),
                aspectRatio: 400 / (row.aspect_ratio as number),
                maxWidth: row.max_width,
                tradingpostUserId: row.trading_post_user_id,
                tradingpostUserEmail: row.trading_post_user_email,
                tradingpostUserHandle: row.trading_post_user_handle,
                tradingpostUserProfileUrl: row.trading_post_user_profile_url,
            }
            return obj;
        });
    }

    getTweetsAndUsersByTweetIds = async (tweetIds: string[]): Promise<TweetsAndUsers[]> => {
        if(tweetIds.length <=0) return [];
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
                     LIMIT 5000;`
        const response = await this.db.query(query, [tweetIds]);

        if (response.length <= 0) return [];

        return response.map((row: any) => {
            let obj: TweetsAndUsers = {
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
                tradingPostTweetCreatedAt: DateTime.fromJSDate(row.trading_post_tweet_created_at),
                tradingPostTwitterCreatedAt: DateTime.fromJSDate(row.trading_post_twitter_created_at),
                tweetID: row.tweet_id,
                tweetTwitterCreatedAt: DateTime.fromJSDate(row.tweet_twitter_created_at),
                tweetURL: row.tweet_url,
                twitterUserID: row.twitter_user_id,
                URLs: row.urls,
                userTwitterCreatedAt: DateTime.fromJSDate(row.user_twitter_created_at),
                aspectRatio: 400 / (row.aspect_ratio as number),
                maxWidth: row.max_width,
                tradingpostUserId: row.trading_post_user_id,
                tradingpostUserEmail: row.trading_post_user_email,
                tradingpostUserHandle: row.trading_post_user_handle,
                tradingpostUserProfileUrl: row.trading_post_user_profile_url,
            }
            return obj;
        });
    }

    upsertTweets = async (formatedTweets: formatedTweet[]): Promise<number> => {
        if (formatedTweets.length <= 0) return 0
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'tweet_id', prop: 'tweet_id'},
                {name: 'twitter_user_id', prop: 'twitter_user_id'},
                {name: 'embed', prop: 'embed'},
                {name: 'lang', prop: 'lang'},
                {name: 'like_count', prop: 'like_count'},
                {name: 'quote_count', prop: 'quote_count'},
                {name: 'reply_count', prop: 'reply_count'},
                {name: 'retweet_count', prop: 'retweet_count'},
                {name: 'possibly_sensitive', prop: 'possibly_sensitive'},
                {name: 'text', prop: 'text'},
                {name: 'tweet_url', prop: 'tweet_url'},
                {name: 'urls', prop: 'urls'},
                {name: 'media_keys', prop: 'media_keys'},
                {name: 'annotations', prop: 'annotations'},
                {name: 'cashtags', prop: 'cashtags'},
                {name: 'hashtags', prop: 'hashtags'},
                {name: 'mentions', prop: 'mentions'},
                {name: 'twitter_created_at', prop: 'twitter_created_at'},
                {name: 'aspect_ratio', prop: 'aspect_ratio'},
                {name: 'max_width', prop: 'max_width'}
            ], {table: 'tweets'})
            const query = this.pgp.helpers.insert(formatedTweets, cs) + ` ON CONFLICT ON CONSTRAINT tweets_tweet_id_key DO UPDATE SET
                                                                            like_count = EXCLUDED.like_count,
                                                                            quote_count = EXCLUDED.quote_count,
                                                                            reply_count = EXCLUDED.reply_count,
                                                                            retweet_count = EXCLUDED.retweet_count,
                                                                            aspect_ratio = EXCLUDED.aspect_ratio,
                                                                            max_width = EXCLUDED.max_width`;

            const result = await this.db.result(query);
            return result.rowCount;
        } catch (err) {
            //console.log(err);
            return 0;
        }
    }

    upsertTwitterUser = async (users: formatedTwitterUser[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'protected', prop: 'protected'},
                {name: 'display_name', prop: 'display_name'},
                {name: 'follower_count', prop: 'follower_count'},
                {name: 'following_count', prop: 'following_count'},
                {name: 'location', prop: 'location'},
                {name: 'twitter_created_at', prop: 'twitter_created_at'},
                {name: 'username', prop: 'username'},
                {name: 'description', prop: 'description'},
                {name: 'profile_image_url', prop: 'profile_image_url'},
                {name: 'profile_url', prop: 'profile_url'},
                {name: 'twitter_user_id', prop: 'twitter_user_id'},
            ], {table: 'twitter_users'})
            const query = this.pgp.helpers.insert(users, cs) + ` ON CONFLICT ON CONSTRAINT twitter_users_twitter_user_id_key DO UPDATE SET
                                                                 display_name = EXCLUDED.display_name,
                                                                 follower_count = EXCLUDED.follower_count,
                                                                 following_count = EXCLUDED.following_count,
                                                                 description = EXCLUDED.description,
                                                                 profile_image_url = EXCLUDED.profile_image_url,
                                                                 profile_url = EXCLUDED.profile_url
                                                                 `;
            const result = await this.db.result(query);
            return result.rowCount
        } catch (err) {
            console.error(err);
            throw err
        }
    }

    insertSubstackArticles = async (formattedArticles: SubstackArticles[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'substack_user_id', prop: 'substack_user_id'},
                {name: 'creator', prop: 'creator'},
                {name: 'title', prop: 'title'},
                {name: 'link', prop: 'link'},
                {name: 'substack_created_at', prop: 'substack_created_at'},
                {name: 'content_encoded', prop: 'content_encoded'},
                {name: 'content_encoded_snippet', prop: 'content_encoded_snippet'},
                {name: 'enclosure', prop: 'enclosure'},
                {name: 'dc_creator', prop: 'dc_creator'},
                {name: 'content', prop: 'content'},
                {name: 'content_snippet', prop: 'content_snippet'},
                {name: 'article_id', prop: 'article_id'},
                {name: 'itunes', prop: 'itunes'},
                {name: 'aspect_ratio', prop: 'aspect_ratio'},
                {name: 'max_width', prop: 'max_width'}
            ], {table: 'substack_articles'});

            const query = this.pgp.helpers.insert(formattedArticles, cs) + ' ON CONFLICT DO NOTHING';

            const result = await this.db.result(query);
            return result.rowCount;
        } catch (err) {
            console.error(err)
            throw err;
        }
    }

    insertSubstackUser = async (data: SubstackUser): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'substack_user_id', prop: 'substack_user_id'},
                {name: 'title', prop: 'title'},
                {name: 'description', prop: 'description'},
                {name: 'link', prop: 'link'},
                {name: 'language', prop: 'language'},
                {name: 'email', prop: 'email'},
                {name: 'image', prop: 'image'},
                {name: 'itunes', prop: 'itunes'},
                {name: 'last_build_date', prop: 'last_build_date'},
            ], {table: 'substack_users'});
            const query = this.pgp.helpers.insert(data, cs) + ' ON CONFLICT (substack_user_id) DO NOTHING';
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const result = await this.db.result(query);
            return result.rowCount;
        } catch (err) {
            console.error(err)
            throw err;
        }
    }

    getEpisodesAndUsersByEpisodeIds = async (episodeIds: string[]): Promise<SpotifyEpisodeAndUser[]> => {
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
        const response = await this.db.query(query, [episodeIds]);
        if (response.length <= 0) return [];
        return response.map((row: any) => {
            let obj: SpotifyEpisodeAndUser = {
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
                episode_release_date: DateTime.fromJSDate(row.episode_release_date),
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
                tradingpost_episode_created_at: DateTime.fromJSDate(row.tradingpost_episode_created_at),
                tradingpost_podcast_created_at: DateTime.fromJSDate(row.tradingpost_podcast_created_at),
                aspectRatio: row.aspect_ratio,
                maxWidth: row.max_width,
                tradingpostUserId: row.tradingpost_user_id,
                tradingpostUserProfileUrl: row.tradingpost_user_profile_url,
                tradingpostUserEmail: row.tradingpost_user_email,
                tradingpostUserHandle: row.tradingpost_user_handle
            };
            return obj;
        });
    }

    getEpisodesAndUsersById = async (id: number): Promise<SpotifyEpisodeAndUserTable[]> => {
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
        const response = await this.db.query(query, [id]);
        if (response.length <= 0) return [];
        return response.map((row: any) => {
            let obj: SpotifyEpisodeAndUserTable = {
                id: row.id,
                created_at: DateTime.fromJSDate(row.tradingpost_episode_created_at),
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
                episode_release_date: DateTime.fromJSDate(row.episode_release_date),
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
                tradingpost_episode_created_at: DateTime.fromJSDate(row.tradingpost_episode_created_at),
                tradingpost_podcast_created_at: DateTime.fromJSDate(row.tradingpost_podcast_created_at),
                aspectRatio: row.aspect_ratio,
                maxWidth: row.max_width,
                tradingpostUserId: row.tradingpost_user_id,
                tradingpostUserProfileUrl: row.tradingpost_user_profile_url,
                tradingpostUserEmail: row.tradingpost_user_email,
                tradingpostUserHandle: row.tradingpost_user_handle
            };
            return obj;
        });
    }

    insertSpotifyEpisodes = async (episodes: spotifyEpisode[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'spotify_episode_id', prop: 'spotify_episode_id'},
                {name: 'spotify_show_id', prop: 'spotify_show_id'},
                {name: 'audio_preview_url', prop: 'audio_preview_url'},
                {name: 'name', prop: 'name'},
                {name: 'description', prop: 'description'},
                {name: 'duration_ms', prop: 'duration_ms'},
                {name: 'explicit', prop: 'explicit'},
                {name: 'html_description', prop: 'html_description'},
                {name: 'is_externally_hosted', prop: 'is_externally_hosted'},
                {name: 'is_playable', prop: 'is_playable'},
                {name: 'language', prop: 'language'},
                {name: 'languages', prop: 'languages'},
                {name: 'embed', prop: 'embed'},
                {name: 'external_urls', prop: 'external_urls'},
                {name: 'images', prop: 'images'},
                {name: 'release_date', prop: 'release_date'},
                {name: 'aspect_ratio', prop: 'aspect_ratio'},
                {name: 'max_width', prop: 'max_width'}
            ], {table: 'spotify_episodes'});

            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const query = this.pgp.helpers.insert(episodes, cs) + ' ON CONFLICT DO NOTHING';
            const results = await this.db.result(query);
            if (!results) return 0;
            return results.rowCount;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    upsertSpotifyShow = async (formattedShows: spotifyShow[]): Promise<number> => {
        try {
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'spotify_show_id', prop: 'spotify_show_id'},
                {name: 'name', prop: 'name'},
                {name: 'description', prop: 'description'},
                {name: 'explicit', prop: 'explicit'},
                {name: 'html_description', prop: 'html_description'},
                {name: 'is_externally_hosted', prop: 'is_externally_hosted'},
                {name: 'media_type', prop: 'media_type'},
                {name: 'publisher', prop: 'publisher'},
                {name: 'copyrights', prop: 'copyrights'},
                {name: 'total_episodes', prop: 'total_episodes'},
                {name: 'languages', prop: 'languages'},
                {name: 'external_urls', prop: 'external_urls'},
                {name: 'images', prop: 'images'},
            ], {table: 'spotify_users'});
            const query = this.pgp.helpers.insert(formattedShows, cs) + ` ON CONFLICT ON CONSTRAINT spotify_users_spotify_show_id_key DO UPDATE SET
                                                                          name = EXCLUDED.name,
                                                                          description = EXCLUDED.description,
                                                                          html_description = EXCLUDED.html_description,
                                                                          total_episodes = EXCLUDED.total_episodes,
                                                                          external_urls = EXCLUDED.external_urls,
                                                                          images = EXCLUDED.images
                                                                          `;
            const results = await this.db.result(query);
            if (!results) return 0;
            return results.rowCount;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    getYoutubeVideosAndChannelsByVideoIds = async (videoIds: string[]): Promise<YouTubeVideoAndChannel[]> => {
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
                     LIMIT 5000;`
        const response = await this.db.query(query, [videoIds]);
        if (response.length <= 0) return [];
        return response.map((row: any) => {
            let obj: YouTubeVideoAndChannel = {
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
                trading_post_channel_created_at: DateTime.fromJSDate(row.trading_post_channel_created_at),
                trading_post_youtube_video_created_at: DateTime.fromJSDate(row.trading_post_youtube_video_created_at),
                video_embed: row.video_embed,
                video_id: row.video_id,
                video_url: row.video_url,
                youtube_channel_id: row.youtube_channel_id,
                youtube_created_at: DateTime.fromJSDate(row.youtube_created_at),
                maxWidth: row.max_width,
                aspectRatio: row.aspect_ratio,
                tradingpostUserId: row.tradingpost_user_id,
                tradingpostUserEmail: row.tradingpost_user_email,
                tradingpostUserHandle: row.tradingpost_user_handle,
                tradingpostUserProfileUrl: row.tradingpost_user_profile_url
            }
            return obj;
        });
    }

    getYoutubeVideosAndChannelsById = async (lastId: number): Promise<YouTubeVideoAndChannelTable[]> => {
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
                     LIMIT 5000;`
        const response = await this.db.query(query, [lastId]);

        if (response.length <= 0) return [];
        return response.map((row: any) => {
            let obj: YouTubeVideoAndChannelTable = {
                id: row.id,
                created_at: DateTime.fromJSDate(row.trading_post_youtube_video_created_at),
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
                trading_post_channel_created_at: DateTime.fromJSDate(row.trading_post_channel_created_at),
                trading_post_youtube_video_created_at: DateTime.fromJSDate(row.trading_post_youtube_video_created_at),
                video_embed: row.video_embed,
                video_id: row.video_id,
                video_url: row.video_url,
                youtube_channel_id: row.youtube_channel_id,
                youtube_created_at: DateTime.fromJSDate(row.youtube_created_at),
                maxWidth: row.max_width,
                aspectRatio: row.aspect_ratio,
                tradingpostUserId: row.tradingpost_user_id,
                tradingpostUserEmail: row.tradingpost_user_email,
                tradingpostUserHandle: row.tradingpost_user_handle,
                tradingpostUserProfileUrl: row.tradingpost_user_profile_url
            }
            return obj;
        });
    }

    insertYoutubeVideos = async (formattedVideos: formatedYoutubeVideo[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'video_id', prop: 'video_id'},
                {name: 'youtube_channel_id', prop: 'youtube_channel_id'},
                {name: 'youtube_created_at', prop: 'youtube_created_at'},
                {name: 'title', prop: 'title'},
                {name: 'description', prop: 'description'},
                {name: 'thumbnails', prop: 'thumbnails'},
                {name: 'video_url', prop: 'video_url'},
                {name: 'video_embed', prop: 'video_embed'},
                {name: 'aspect_ratio', prop: 'aspect_ratio'},
                {name: 'max_width', prop: 'max_width'}
            ], {table: 'youtube_videos'});
            const query = this.pgp.helpers.insert(formattedVideos, cs) + ' ON CONFLICT DO NOTHING;'
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const result = await this.db.result(query)
            return result.rowCount;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    insertChannelInfo = async (data: formatedChannelInfo[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'youtube_channel_id', prop: 'youtube_channel_id'},
                {name: 'title', prop: 'title'},
                {name: 'description', prop: 'description'},
                {name: 'country', prop: 'country'},
                {name: 'custom_url', prop: 'custom_url'},
                {name: 'youtube_created_at', prop: 'youtube_created_at'},
                {name: 'thumbnails', prop: 'thumbnails'},
                {name: 'statistics', prop: 'statistics'},
                {name: 'status', prop: 'status'},
            ], {table: 'youtube_users'})

            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const query = this.pgp.helpers.insert(data, cs) + `ON CONFLICT DO NOTHING`;
            const result = await this.db.result(query)
            return result.rowCount;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
    getTradingPostsAndUsers = async (lastId: number): Promise<TradingPostsAndUsersTable[]> => {
        try {
            let query = `SELECT dp.id,
                                dp.user_id,
                                dp.subscription_level,
                                dp.title, 
                                dp.body,
                                dp.created_at,
                                dp.updated_at,
                                (dp.max_width::numeric(24,4)) AS max_width,
                                (dp.aspect_ratio::numeric(24,4)) AS aspect_ratio,
                                du.handle AS tradingpost_user_handle,
                                du.email AS tradingpost_user_email,
                                du.profile_url AS tradingpost_user_profile_url
                         FROM data_post dp
                         INNER JOIN data_user du
                                ON dp.user_id = du.id
                         WHERE dp.id > $1
                         ORDER BY dp.id;
                         `;
            const response = await this.db.query(query, [lastId]);
            if (response.length <= 0) return [];
            return response.map((row: any) => {
                let o: TradingPostsAndUsersTable = {
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
                    created_at: DateTime.fromJSDate(row.created_at),
                    updated_at: DateTime.fromJSDate(row.updated_at)
                }
                console.log()
                return o;
            })
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}

