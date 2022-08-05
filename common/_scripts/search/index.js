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
require("dotenv/config");
process.env.CONFIGURATION_ENV = "production";
const pg_1 = require("pg");
const elasticsearch_1 = require("@elastic/elasticsearch");
const configuration_1 = require("../..//configuration");
const luxon_1 = require("luxon");
const yargs_1 = __importDefault(require("yargs"));
const fs_1 = __importDefault(require("fs"));
class Twitter {
    constructor(dbClient) {
        this.getItems = (lastId) => __awaiter(this, void 0, void 0, function* () {
            if (lastId === null)
                lastId = 0;
            let query = `SELECT t.id                  AS id,
                            t.tweet_id            AS tweet_id,
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
                     WHERE t.id > ${lastId}
                     ORDER BY t.id ASC
                     LIMIT 5000;`;
            const response = yield this.dbClient.query(query);
            if (response.rows.length <= 0)
                return { items: [], lastId: null };
            const tweetsAndUsers = response.rows.map((row) => {
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
                    userID: row.trading_post_user_id,
                    userTwitterCreatedAt: luxon_1.DateTime.fromJSDate(row.user_twitter_created_at)
                };
                return obj;
            });
            return { items: this.map(tweetsAndUsers), lastId: response.rows[response.rows.length - 1].id };
        });
        this.map = (items) => {
            return items.map(tw => {
                let obj = {
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
                    user: {
                        id: tw.userID.toString(),
                        imageUrl: "",
                        name: "",
                        type: "husk",
                        username: ""
                    }
                };
                return obj;
            });
        };
        this.dbClient = dbClient;
    }
}
class SubStack {
    constructor(dbClient) {
        this.getItems = (lastId) => __awaiter(this, void 0, void 0, function* () {
            if (lastId === null)
                lastId = 0;
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
                     WHERE sa.id > ${lastId}
                     ORDER BY sa.id ASC;`;
            const response = yield this.dbClient.query(query);
            if (!response.rows || response.rows.length <= 0)
                return { items: [], lastId: null };
            const substackAndNewsletters = response.rows.map((row) => {
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
                    tradingpost_user_id: row.tradingpost_user_id
                };
                return obj;
            });
            return { items: this.map(substackAndNewsletters), lastId: response.rows[response.rows.length - 1].id };
        });
        this.map = (items) => {
            return items.map((n) => {
                let obj = {
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
                    user: {
                        id: n.tradingpost_user_id.toString(),
                        imageUrl: "",
                        name: "",
                        type: "husk",
                        username: ""
                    }
                };
                return obj;
            });
        };
        this.dbClient = dbClient;
    }
}
class Spotify {
    constructor(dbClient) {
        this.getItems = (lastId) => __awaiter(this, void 0, void 0, function* () {
            if (lastId === null)
                lastId = 0;
            let query = `SELECT se.id                   AS id,
                            se.spotify_episode_id,
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
                     WHERE se.id > ${lastId}
                     ORDER BY se.id ASC
                     LIMIT 5000;`;
            const response = yield this.dbClient.query(query);
            if (!response.rows || response.rows.length <= 0)
                return { items: [], lastId: null };
            const spotifyItems = response.rows.map((row) => {
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
                    tradingpost_user_id: row.tradingpost_user_id
                };
                return obj;
            });
            return { items: this.map(spotifyItems), lastId: response.rows[response.rows.length - 1].id };
        });
        this.map = (items) => {
            return items.map((si) => {
                let obj = {
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
                        id: si.tradingpost_user_id.toString(),
                        imageUrl: null,
                        name: "",
                        type: "husk",
                        username: ""
                    }
                };
                return obj;
            });
        };
        this.dbClient = dbClient;
    }
}
class YouTube {
    constructor(dbClient) {
        this.getItems = (lastId) => __awaiter(this, void 0, void 0, function* () {
            if (lastId === null)
                lastId = 0;
            let query = `select yv.id                 AS id,
                            yv.video_id,
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
                     WHERE yv.id > ${lastId}
                     ORDER BY yv.id ASC
                     LIMIT 5000;`;
            const response = yield this.dbClient.query(query);
            if (!response.rows || response.rows.length <= 0)
                return { items: [], lastId: null };
            const youtubeVideosAndChannel = response.rows.map((row) => {
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
                    user_id: row.user_id,
                    video_embed: row.video_embed,
                    video_id: row.video_id,
                    video_url: row.video_url,
                    youtube_channel_id: row.youtube_channel_id,
                    youtube_created_at: luxon_1.DateTime.fromJSDate(row.youtube_created_at)
                };
                return obj;
            });
            return { items: this.map(youtubeVideosAndChannel), lastId: response.rows[response.rows.length - 1].id };
        });
        this.map = (items) => {
            return items.map((yv) => {
                let obj = {
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
                        id: yv.user_id.toString(),
                        imageUrl: null,
                        name: "",
                        type: "husk",
                        username: ""
                    }
                };
                return obj;
            });
        };
        this.dbClient = dbClient;
    }
}
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const indexName = "tradingpost-search";
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgClient = new pg_1.Client({
        host: postgresConfiguration['host'],
        user: postgresConfiguration['user'],
        password: postgresConfiguration['password'],
        database: postgresConfiguration['database']
    });
    yield pgClient.connect();
    const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new elasticsearch_1.Client({
        cloud: {
            id: elasticConfiguration['cloudId']
        },
        auth: {
            apiKey: elasticConfiguration['apiKey']
        },
        maxRetries: 5,
    });
    const argv = (0, yargs_1.default)(process.argv.slice(2)).argv;
    // @ts-ignore
    if (argv.scratch)
        yield rebuildElasticIndex(elasticClient, indexName);
    let providers = [new Twitter(pgClient), new SubStack(pgClient), new Spotify(pgClient), new YouTube(pgClient)];
    for (let i = 0; i < providers.length; i++) {
        const provider = providers[i];
        let id = null;
        while (true) {
            let items, lastId;
            ({ items, lastId: lastId } = yield provider.getItems(id));
            if (items.length <= 0)
                break;
            yield ingestToElastic(elasticClient, items, indexName);
            id = lastId;
        }
    }
    yield pgClient.end();
});
const rebuildElasticIndex = (elasticClient, indexName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield elasticClient.indices.delete({ index: indexName });
    }
    catch (e) {
        console.error();
    }
    const esIndexSchema = JSON.parse(fs_1.default.readFileSync('../../../elastic/schema.json', 'utf8'));
    let synonymList = fs_1.default.readFileSync('../../../elastic/stock_ticker_synonyms.txt').toString().split("\n");
    synonymList = synonymList.map(a => a.slice(0, -1));
    // @ts-ignore
    yield elasticClient.indices.create({
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
});
/**
 * Bulk upload documents into ElasticSearch
 * @param elasticClient
 * @param items
 * @param indexName
 */
const ingestToElastic = (elasticClient, items, indexName) => __awaiter(void 0, void 0, void 0, function* () {
    let group = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        group.push(item);
        if (group.length === 100 || i === items.length - 1) {
            const operations = group.flatMap(doc => [{ index: { _index: indexName, _id: doc.id } }, doc]);
            const bulkResponse = yield elasticClient.bulk({ refresh: false, operations });
            if (bulkResponse.errors) {
                const erroredDocs = [];
                bulkResponse.items.forEach((action, idx) => {
                    const operation = Object.keys(action)[0];
                    // @ts-ignore
                    if (action[operation].error) {
                        erroredDocs.push({
                            // @ts-ignore
                            status: action[operation].status,
                            // @ts-ignore
                            error: action[operation].error,
                        });
                    }
                });
                console.log(erroredDocs);
            }
        }
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHlCQUF1QjtBQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFDLFlBQVksQ0FBQztBQUMzQywyQkFBOEM7QUFDOUMsMERBQWlFO0FBQ2pFLHdEQUFxRDtBQVFyRCxpQ0FBaUM7QUFFakMsa0RBQTBCO0FBQzFCLDRDQUFvQjtBQUVwQixNQUFNLE9BQU87SUFHVCxZQUFZLFFBQXdCO1FBSXBDLGFBQVEsR0FBRyxDQUFPLE1BQWMsRUFBMkQsRUFBRTtZQUN6RixJQUFJLE1BQU0sS0FBSyxJQUFJO2dCQUFFLE1BQU0sR0FBRyxDQUFDLENBQUE7WUFDL0IsSUFBSSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29DQW1DZ0IsTUFBTTs7aUNBRVQsQ0FBQTtZQUN6QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFFbEUsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDbEQsSUFBSSxHQUFHLEdBQWtCO29CQUNyQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7b0JBQzVCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixlQUFlLEVBQUUsR0FBRyxDQUFDLGdCQUFnQjtvQkFDckMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixLQUFLLEVBQUUsR0FB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