import 'dotenv/config';
import {Client as PostgresClient} from 'pg';
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {DefaultConfig} from '../../configuration';
import {
    TweetsAndUser,
    ElasticSearchBody,
    YouTubeVideoAndChannel,
    SubstackAndNewsletter,
    SpotifyEpisodeAndUser
} from "./interfaces";
import {DateTime} from 'luxon';
import {LastID, Provider} from "./interfaces";
import yargs from "yargs";
import fs from "fs";

class Twitter {
    private dbClient: PostgresClient;
    public name: string;

    constructor(dbClient: PostgresClient) {
        this.dbClient = dbClient
        this.name = "Twitter";
    }

    getItems = async (lastId: LastID): Promise<{ items: ElasticSearchBody[], lastId: LastID }> => {
        if (lastId === null) lastId = 0
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
                     WHERE t.id > ${lastId}
                       AND t.aspect_ratio != 0
                       AND t.aspect_ratio IS NOT NULL
                     ORDER BY t.id
                     LIMIT 5000;`
        const response = await this.dbClient.query(query);

        if (response.rows.length <= 0) return {items: [], lastId: null};

        const tweetsAndUsers = response.rows.map((row: any) => {
            let obj: TweetsAndUser = {
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
        return {items: this.map(tweetsAndUsers), lastId: response.rows[response.rows.length - 1].id}
    }

    map = (items: TweetsAndUser[]): ElasticSearchBody[] => {
        return items.map(tw => {
            let obj: ElasticSearchBody = {
                id: `twitter_${tw.tweetID}`,
                content: {
                    body: tw.text,
                    description: tw.text,
                    htmlBody: tw.embed,
                    htmlTitle: null,
                    title: null
                },
                imageUrl: null,
                meta: {},
                platform: {
                    displayName: tw.displayName,
                    imageUrl: tw.profileImageURL,
                    profileUrl: tw.profileURL,
                    username: tw.twitterUsername
                },
                platformCreatedAt: tw.tweetTwitterCreatedAt.toISO(),
                platformUpdatedAt: null,
                postType: "tweet",
                postTypeValue: 1,
                postUrl: tw.tweetURL,
                ratingsCount: 0,
                tradingpostCreatedAt: tw.tradingPostTweetCreatedAt.toISO(),
                tradingpostUpdatedAt: null,
                size: {
                    maxWidth: tw.maxWidth,
                    aspectRatio: tw.aspectRatio
                },
                user: {
                    id: tw.tradingpostUserId,
                    imageUrl: tw.tradingpostUserProfileUrl,
                    name: "",
                    type: "",
                    username: tw.tradingpostUserHandle
                }

            };
            return obj;
        })
    }
}

class SubStack {
    private dbClient: PostgresClient
    public name: string

    constructor(dbClient: PostgresClient) {
        this.dbClient = dbClient
        this.name = "Substack"
    }

    getItems = async (lastId: LastID): Promise<{ items: ElasticSearchBody[], lastId: LastID }> => {
        if (lastId === null) lastId = 0
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
                     WHERE sa.id > ${lastId}
                       AND sa.aspect_ratio != 0
                       AND sa.aspect_ratio IS NOT NULL
                     ORDER BY sa.id;`
        const response = await this.dbClient.query(query);

        if (!response.rows || response.rows.length <= 0) return {items: [], lastId: null};
        const substackAndNewsletters = response.rows.map((row: any) => {
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

        return {items: this.map(substackAndNewsletters), lastId: response.rows[response.rows.length - 1].id}
    }

    map = (items: SubstackAndNewsletter[]): ElasticSearchBody[] => {
        return items.map((n: SubstackAndNewsletter) => {
            let obj: ElasticSearchBody = {
                id: `substack_${n.article_id}`,
                content: {
                    body: n.content,
                    description: n.content_snippet,
                    htmlBody: n.content_encoded,
                    htmlTitle: n.content_encoded_snippet,
                    title: n.content_snippet
                },
                imageUrl: n.newsletter_image.url,
                meta: {},
                platform: {
                    displayName: n.creator,
                    imageUrl: null,
                    profileUrl: n.newsletter_link,
                    username: null
                },
                platformCreatedAt: n.substack_article_created_at.toISO(),
                platformUpdatedAt: n.substack_article_created_at.toISO(),
                postType: "substack",
                postTypeValue: 3,
                postUrl: n.link,
                ratingsCount: 0,
                tradingpostCreatedAt: n.tradingpost_substack_article_created_at.toISO(),
                tradingpostUpdatedAt: n.tradingpost_substack_article_created_at.toISO(),
                size: {
                    maxWidth: n.maxWidth,
                    aspectRatio: n.aspectRatio,
                },
                user: {
                    id: n.tradingpostUserId,
                    imageUrl: n.tradingpostProfileUrl,
                    name: "",
                    type: "",
                    username: n.tradingpostUserHandle
                }
            };
            return obj;
        })
    }
}

class Spotify {
    private dbClient: PostgresClient
    public name: string;

    constructor(dbClient: PostgresClient) {
        this.dbClient = dbClient
        this.name = 'Spotify'
    }

    getItems = async (lastId: LastID): Promise<{ items: ElasticSearchBody[], lastId: LastID }> => {
        if (lastId === null) lastId = 0
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
                     WHERE se.id > ${lastId}
                       AND se.aspect_ratio != 0
                       AND se.aspect_ratio IS NOT NULL
                     ORDER BY se.id
                     LIMIT 5000;`;
        const response = await this.dbClient.query(query);

        if (!response.rows || response.rows.length <= 0) return {items: [], lastId: null};
        const spotifyItems = response.rows.map((row: any) => {
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

        return {items: this.map(spotifyItems), lastId: response.rows[response.rows.length - 1].id}
    }

    map = (items: SpotifyEpisodeAndUser[]): ElasticSearchBody[] => {
        return items.map((si: SpotifyEpisodeAndUser) => {
            let obj: ElasticSearchBody = {
                id: `spotify_${si.spotify_episode_id}`,
                content: {
                    body: si.episode_embed.html,
                    description: si.episode_description,
                    htmlBody: si.episode_html_description,
                    htmlTitle: null,
                    title: si.episode_name
                },
                imageUrl: null,
                meta: {},
                platform: {
                    displayName: si.podcast_name,
                    imageUrl: null,
                    profileUrl: null,
                    username: si.podcast_publisher
                },
                platformCreatedAt: si.episode_release_date.toISO(),
                platformUpdatedAt: si.episode_release_date.toISO(),
                postType: "spotify",
                postTypeValue: 2,
                postUrl: si.episode_embed.provider_url,
                ratingsCount: 0,
                tradingpostCreatedAt: si.tradingpost_episode_created_at.toISO(),
                tradingpostUpdatedAt: si.tradingpost_episode_created_at.toISO(),
                user: {
                    id: si.tradingpostUserId,
                    imageUrl: si.tradingpostUserProfileUrl,
                    name: "",
                    type: "",
                    username: si.tradingpostUserHandle
                },
                size: {
                    maxWidth: si.maxWidth,
                    aspectRatio: si.aspectRatio
                }
            };
            return obj;
        })
    }
}

class YouTube {
    private dbClient: PostgresClient
    public name: string

    constructor(dbClient: PostgresClient) {
        this.dbClient = dbClient
        this.name = 'YouTube'
    }

    getItems = async (lastId: LastID): Promise<{ items: ElasticSearchBody[], lastId: LastID }> => {
        if (lastId === null) lastId = 0
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
                     WHERE yv.id > ${lastId}
                       AND yv.aspect_ratio != 0
                       AND yv.aspect_ratio IS NOT NULL
                     ORDER BY yv.id
                     LIMIT 5000;`
        const response = await this.dbClient.query(query);

        if (!response.rows || response.rows.length <= 0) return {items: [], lastId: null};
        const youtubeVideosAndChannel: YouTubeVideoAndChannel[] = response.rows.map((row: any) => {
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

        return {items: this.map(youtubeVideosAndChannel), lastId: response.rows[response.rows.length - 1].id}
    }

    map = (items: YouTubeVideoAndChannel[]): ElasticSearchBody[] => {
        return items.map((yv: YouTubeVideoAndChannel) => {
            let obj: ElasticSearchBody = {
                id: `youtube_${yv.video_id}`,
                content: {
                    body: yv.description,
                    description: yv.description,
                    htmlBody: null,
                    htmlTitle: null,
                    title: yv.title
                },
                imageUrl: null,
                meta: {},
                platform: {
                    displayName: yv.channel_title,
                    imageUrl: null,
                    profileUrl: yv.custom_channel_url,
                    username: null
                },
                platformCreatedAt: yv.youtube_created_at.toISO(),
                platformUpdatedAt: yv.youtube_created_at.toISO(),
                postType: "youtube",
                postTypeValue: 3,
                postUrl: yv.video_url,
                ratingsCount: 0,
                tradingpostCreatedAt: yv.trading_post_youtube_video_created_at.toISO(),
                tradingpostUpdatedAt: yv.trading_post_youtube_video_created_at.toISO(),
                user: {
                    id: yv.tradingpostUserId,
                    imageUrl: yv.tradingpostUserProfileUrl,
                    name: "",
                    type: "",
                    username: yv.tradingpostUserHandle
                },
                size: {
                    maxWidth: yv.maxWidth,
                    aspectRatio: yv.aspectRatio
                }
            };
            return obj;
        })
    }
}

const run = async () => {
    const indexName = "tradingpost-search";

    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");

    const pgClient = new PostgresClient({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()
    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration['cloudId'] as string
        },
        auth: {
            apiKey: elasticConfiguration['apiKey'] as string
        },
        maxRetries: 5,
    });

    const argv = yargs(process.argv.slice(2)).argv;
    // @ts-ignore
    if (argv.scratch) await rebuildElasticIndex(elasticClient, indexName);

    let providers: Provider[] = [new Twitter(pgClient), new SubStack(pgClient), new Spotify(pgClient), new YouTube(pgClient)];
    for (let i = 0; i < providers.length; i++) {
        const provider = providers[i];
        let id: LastID = null;
        console.log("Ingesting: ", provider.name)
        let count = 0
        while (true) {
            let items: ElasticSearchBody[], lastId: string | number | null;
            ({items, lastId: lastId} = await provider.getItems(id));

            if (items.length <= 0) break;
            await ingestToElastic(elasticClient, items, indexName)
            id = lastId
            count = items.length + count
            console.log("\t Ingest Count: ", count)
        }
    }

    await pgClient.end()
    console.log("Finished")
}

const rebuildElasticIndex = async (elasticClient: ElasticClient, indexName: string) => {
    try {
        await elasticClient.indices.delete({index: indexName});
    } catch (e) {
        console.error()
    }

    const esIndexSchema = JSON.parse(fs.readFileSync('../../../elastic/schema.json', 'utf8'));
    let synonymList = fs.readFileSync('../../../elastic/stock_ticker_synonyms.txt').toString().split("\n");
    synonymList = synonymList.map(a => a.slice(0, -1));

    // @ts-ignore
    await elasticClient.indices.create({
        index: indexName,
        mappings: esIndexSchema.mappings,
        settings: {
            "index": {
                "analysis": {
                    "filter": {
                        "synonym_filter": {
                            "type": "synonym",
                            "synonyms": synonymList,
                            "updateable": true
                        }
                    },
                    "tokenizer": {
                        "my_tokenizer": {
                            "type": "pattern",
                            "pattern": ","
                        }
                    },
                    "analyzer": {
                        // @ts-ignore
                        "synonym_analyzer": {
                            "tokenizer": "my_tokenizer",
                            "filter": ["synonym_filter"]
                        },
                        "default": {
                            "type": "whitespace"
                        },
                        "default_search": {
                            "type": "keyword"
                        }
                    }
                }
            }
        }
    });
}

/**
 * Bulk upload documents into ElasticSearch
 * @param elasticClient
 * @param items
 * @param indexName
 */
const ingestToElastic = async (elasticClient: ElasticClient, items: ElasticSearchBody[], indexName: string) => {
    let group = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        group.push(item)
        if (group.length === 100 || i === items.length - 1) {
            const operations = group.flatMap(doc => [{index: {_index: indexName, _id: doc.id}}, doc]);
            const bulkResponse = await elasticClient.bulk({refresh: false, operations});
            if (bulkResponse.errors) {
                const erroredDocs: {
                    // @ts-ignore
                    status: any;
                    // @ts-ignore
                    error: any;
                }[] = [];
                bulkResponse.items.forEach((action, idx) => {
                    const operation = Object.keys(action)[0]
                    // @ts-ignore
                    if (action[operation].error) {
                        erroredDocs.push({
                            // @ts-ignore
                            status: action[operation].status,
                            // @ts-ignore
                            error: action[operation].error,
                        })
                    }
                });
                console.log(erroredDocs)
            }
        }
    }
}

(async () => {
    await run()
})()