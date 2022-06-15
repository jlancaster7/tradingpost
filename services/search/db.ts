import {Client as PostgresClient} from 'pg';
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {Configuration} from '@tradingpost/common/configuration';
import {
    TweetsAndUser,
    ElasticSearchBody,
    YouTubeVideoAndChannel,
    SubstackAndNewsletter,
    SpotifyEpisodeAndUser
} from "./interfaces";
import {DateTime} from 'luxon';

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);

const run = async () => {
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const pgClient = new PostgresClient({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    });
    await pgClient.connect()

    const elasticConfiguration = await configuration.fromSSM("/production/elastic");
    const elasticClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration['cloudId'] as string
        },
        auth: {
            apiKey: elasticConfiguration['apiKey'] as string
        },
        maxRetries: 5,
    });

    const ingestSrv = IngestSrv(pgClient, async (items: ElasticSearchBody[]) => {
        let group = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.id) delete (item.id)
            group.push(item)
            if (group.length === 100 || i === items.length - 1) {
                const operations = group.flatMap(doc => [{index: {_index: 'tradingpost-search'}}, doc]);
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
                    })
                    console.log(erroredDocs)
                }
            }
        }
    });

    await Promise.all([
        ingestSrv.twitter(),
        ingestSrv.substack(),
        ingestSrv.youtube(),
        ingestSrv.spotify()
    ]);
    await pgClient.end()
}

type SearchIngester = (items: ElasticSearchBody[]) => void;

const IngestSrv = (dbClient: PostgresClient, ingester: SearchIngester) => {
    return {
        twitter: async () => {
            let lastId = 0;
            while (true) {
                let query = `SELECT t.tweet_id            AS tweet_id,
                                    t.user_id             AS trading_post_user_id,
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
                                    tu.created_at         AS trading_post_twitter_created_at
                             FROM tweets t
                                      INNER JOIN twitter_users tu ON
                                 tu.twitter_user_id = t.twitter_user_id
                             WHERE t.tweet_id > ${lastId}
                             ORDER BY t.tweet_id ASC
                             LIMIT 5000;`
                const response = await dbClient.query(query);
                if (!response.rows || response.rows.length <= 0) break;

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
                        tradingPostTweetCreatedAt: DateTime.fromISO(row.trading_post_tweet_created_at),
                        tradingPostTwitterCreatedAt: DateTime.fromISO(row.trading_post_twitter_created_at),
                        tweetID: row.tweet_id,
                        tweetTwitterCreatedAt: DateTime.fromISO(row.tweet_twitter_created_at),
                        tweetURL: row.tweet_url,
                        twitterUserID: row.twitter_user_id,
                        URLs: row.urls,
                        userID: row.trading_post_user_id,
                        userTwitterCreatedAt: DateTime.fromISO(row.user_twitter_created_at)
                    }
                    return obj;
                });
                await ingester(tweetsAndUsers.map(tw => {
                    let obj: ElasticSearchBody = {
                        id: null,
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
                        platformCreatedAt: tw.tweetTwitterCreatedAt,
                        platformUpdatedAt: null,
                        postType: "tweet",
                        postUrl: tw.tweetURL,
                        ratingsCount: 0,
                        tradingpostCreatedAt: tw.tradingPostTweetCreatedAt,
                        tradingpostUpdatedAt: null,
                        user: {
                            id: tw.userID.toString(),
                            imageUrl: "",
                            name: "",
                            type: "husk",
                            username: ""
                        }

                    };
                    return obj;
                }))
                lastId = response.rows[response.rows.length - 1].tweet_id
            }
        },
        substack: async () => {
            let lastId = '';
            while (true) {
                let query = `SELECT sa.substack_user_id,
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
                                    su.user_id             as tradingpost_user_id,
                                    su.title               as newsletter_title,
                                    su.description         as newsletter_description,
                                    su.link                as newsletter_link,
                                    su.language            as newsletter_language,
                                    su.email               as newsletter_email,
                                    su.image               as newsletter_image,
                                    su.itunes              as newsletter_itunes,
                                    su.last_build_date     as last_newsletter_build_date,
                                    su.created_at          as substack_added_to_tradingpost_date
                             FROM substack_articles sa
                                      INNER JOIN substack_users su
                                                 ON su.substack_user_id = sa.substack_user_id
                             WHERE article_id > '${lastId}'
                             ORDER BY article_id ASC;`
                const response = await dbClient.query(query);
                if (!response.rows || response.rows.length <= 0) break;
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
                        last_newsletter_build_date: DateTime.fromISO(row.last_newsletter_build_date),
                        link: row.link,
                        newsletter_description: row.newsletter_description,
                        newsletter_email: row.newsletter_email,
                        newsletter_image: row.newsletter_image,
                        newsletter_itunes: row.newsletter_itunes,
                        newsletter_language: row.newsletter_language,
                        newsletter_link: row.newsletter_link,
                        newsletter_title: row.newsletter_title,
                        substack_added_to_tradingpost_date: DateTime.fromISO(row.substack_added_to_tradingpost_date),
                        substack_article_created_at: DateTime.fromISO(row.substack_article_created_at),
                        substack_user_id: row.substack_user_id,
                        title: row.title,
                        tradingpost_substack_article_created_at: DateTime.fromISO(row.tradingpost_substack_article_created_at),
                        tradingpost_user_id: row.tradingpost_user_id
                    }
                    return obj;
                });

                await ingester(substackAndNewsletters.map(n => {
                    let obj: ElasticSearchBody = {
                        id: null,
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
                        platformCreatedAt: n.substack_article_created_at,
                        platformUpdatedAt: n.substack_article_created_at,
                        postType: "substack",
                        postUrl: n.link,
                        ratingsCount: 0,
                        tradingpostCreatedAt: n.tradingpost_substack_article_created_at,
                        tradingpostUpdatedAt: n.tradingpost_substack_article_created_at,
                        user: {
                            id: n.tradingpost_user_id.toString(),
                            imageUrl: "",
                            name: "",
                            type: "husk",
                            username: ""
                        }
                    };
                    return obj;
                }))

                lastId = response.rows[response.rows.length - 1].article_id
            }
        },
        youtube: async () => {
            let lastId = '';
            while (true) {
                let query = `select yv.video_id,
                                    yv.youtube_channel_id,
                                    yv.user_id,
                                    yv.title,
                                    yv.description,
                                    yv.video_url,
                                    yv.video_embed,
                                    yv.thumbnails,
                                    yv.youtube_created_at,
                                    yv.created_at         as trading_post_youtube_video_created_at,
                                    yu.title              as channel_title,
                                    yu.description        as channel_description,
                                    yu.country,
                                    yu.custom_url         as custom_channel_url,
                                    yu.thumbnails         as channel_thumbails,
                                    yu.statistics         as channel_statistics,
                                    yu.status             as channel_status,
                                    yu.youtube_created_at as channel_created_at,
                                    yu.created_at         as trading_post_channel_created_at
                             FROM youtube_videos yv
                                      INNER JOIN
                                  youtube_users yu
                                  ON
                                      yu.youtube_channel_id = yv.youtube_channel_id
                             WHERE video_id > '${lastId}'
                             ORDER BY video_id ASC
                             LIMIT 5000;`
                const response = await dbClient.query(query);
                if (!response.rows || response.rows.length <= 0) break;
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
                        trading_post_channel_created_at: DateTime.fromISO(row.trading_post_channel_created_at),
                        trading_post_youtube_video_created_at: DateTime.fromISO(row.trading_post_youtube_video_created_at),
                        user_id: row.user_id,
                        video_embed: row.video_embed,
                        video_id: row.video_id,
                        video_url: row.video_url,
                        youtube_channel_id: row.youtube_channel_id,
                        youtube_created_at: DateTime.fromISO(row.youtube_created_at)
                    }
                    return obj;
                });

                await ingester(youtubeVideosAndChannel.map((yv: YouTubeVideoAndChannel) => {
                    let obj: ElasticSearchBody = {
                        id: null,
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
                        platformCreatedAt: yv.youtube_created_at,
                        platformUpdatedAt: yv.youtube_created_at,
                        postType: "youtube",
                        postUrl: yv.video_url,
                        ratingsCount: 0,
                        tradingpostCreatedAt: yv.trading_post_youtube_video_created_at,
                        tradingpostUpdatedAt: yv.trading_post_youtube_video_created_at,
                        user: {
                            id: yv.user_id.toString(),
                            imageUrl: null,
                            name: "",
                            type: "husk",
                            username: ""
                        }

                    };
                    return obj;
                }))
                lastId = response.rows[response.rows.length - 1].video_id
            }

        },
        spotify: async () => {
            let lastId = '';
            while (true) {
                let query = `SELECT se.spotify_episode_id,
                                    se.spotify_show_id,
                                    se.audio_preview_url,
                                    se.name                 as episode_name,
                                    se.description          as episode_description,
                                    se.duration_ms          as episode_duration_ms,
                                    se.explicit             as is_episode_explicit,
                                    se.html_description     as episode_html_description,
                                    se.is_externally_hosted as is_episode_externally_hosted,
                                    se.is_playable          as is_episode_playable,
                                    se.language             as episode_language,
                                    se.languages            as episode_languages,
                                    se.embed                as episode_embed,
                                    se.external_urls        as episode_external_urls,
                                    se.images               as episode_images,
                                    se.release_date         as episode_release_date,
                                    se.created_at           as tradingpost_episode_created_at,
                                    su.user_id              as tradingpost_user_id,
                                    su.name                 as podcast_name,
                                    su.description          as podcast_description,
                                    su.explicit             as is_podcast_explicit,
                                    su.html_description     as podcast_html_description,
                                    su.is_externally_hosted as is_podcast_externally_hosted,
                                    su.media_type           as podcast_media_type,
                                    su.publisher            as podcast_publisher,
                                    su.total_episodes       as podcast_total_episodes,
                                    su.languages            as podcast_languages,
                                    su.external_urls        as podcast_external_urls,
                                    su.images               as podcast_images,
                                    su.copyrights           as podcast_copyrights,
                                    su.created_at           as tradingpost_podcast_created_at
                             FROM spotify_episodes se
                                      INNER JOIN spotify_users su
                                                 ON su.spotify_show_id = se.spotify_show_id
                             WHERE spotify_episode_id > '${lastId}'
                             ORDER BY spotify_episode_id ASC
                             LIMIT 5000;`;
                const response = await dbClient.query(query);
                if (!response.rows || response.rows.length <= 0) break;
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
                        episode_release_date: DateTime.fromISO(row.episode_release_date),
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
                        tradingpost_episode_created_at: DateTime.fromISO(row.tradingpost_episode_created_at),
                        tradingpost_podcast_created_at: DateTime.fromISO(row.tradingpost_podcast_created_at),
                        tradingpost_user_id: row.tradingpost_user_id
                    };
                    return obj;
                });
                await ingester(spotifyItems.map((si: SpotifyEpisodeAndUser) => {
                    let obj: ElasticSearchBody = {
                        id: null,
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
                        platformCreatedAt: si.episode_release_date,
                        platformUpdatedAt: si.episode_release_date,
                        postType: "spotify",
                        postUrl: si.episode_embed.provider_url,
                        ratingsCount: 0,
                        tradingpostCreatedAt: si.tradingpost_episode_created_at,
                        tradingpostUpdatedAt: si.tradingpost_episode_created_at,
                        user: {
                            id: si.tradingpost_user_id.toString(),
                            imageUrl: null,
                            name: "",
                            type: "husk",
                            username: ""
                        }
                    };
                    return obj;
                }));
                lastId = response.rows[response.rows.length - 1].video_id
            }
        }
    }
}

(async () => {
    await run()
})()