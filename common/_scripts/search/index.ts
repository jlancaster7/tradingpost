import 'dotenv/config';
import {Client as PostgresClient} from 'pg';
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {DefaultConfig} from '../../configuration';
import {DateTime} from 'luxon';
import yargs from "yargs";
import fs from "fs";
import Repository from "../../social-media/repository";
import ElasticService from "../../elastic/index";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {DefaultYoutube} from "../../social-media/youtube/service";
import PostPrepper from "../../post-prepper/index";
import {DefaultTwitter} from "../../social-media/twitter/service";
import {DefaultSubstack} from "../../social-media/substack/service";
import {DefaultSpotify} from "../../social-media/spotify/service";

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()
    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticService = new ElasticService(new ElasticClient({
        cloud: {
            id: elasticConfiguration['cloudId'] as string
        },
        auth: {
            apiKey: elasticConfiguration['apiKey'] as string
        },
        maxRetries: 5,
    }));

    const postPrepper = new PostPrepper();
    const repository = new Repository(pgClient, pgp);

    const youtubeCfg = await DefaultConfig.fromCacheOrSSM("youtube");
    const youtube = DefaultYoutube(youtubeCfg, pgClient, pgp, elasticService);

    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    const twitter = DefaultTwitter(twitterConfiguration, pgClient, pgp, elasticService);

    const substack = DefaultSubstack(pgClient, pgp, elasticService)

    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");
    const spotify = DefaultSpotify(elasticService, pgClient, pgp, spotifyConfiguration)

    const argv = yargs(process.argv.slice(2)).argv;

    // @ts-ignore
    if (argv.scratch) await rebuildElasticIndex(elasticClient, indexName);

    const indexName = "tradingpost-search";

    console.log("Processing YouTube")
    let lastYouTubeId = '';
    while (true) {
        const videosAndChannels = await youtube.exportYouTubeVideoAndChannels(lastYouTubeId);
        if (videosAndChannels.length <= 0) break
        lastYouTubeId = videosAndChannels[videosAndChannels.length - 1].video_id
        await elasticService.ingest(youtube.map(videosAndChannels), indexName)
    }

    console.log("Processing Spotify")
    let lastSpotifyEpisodeId = '';
    while (true) {
        const episodesAndUsers = await spotify.exportEpisodesAndUsers(lastSpotifyEpisodeId);
        if (episodesAndUsers.length <= 0) break
        lastSpotifyEpisodeId = episodesAndUsers[episodesAndUsers.length - 1].spotify_episode_id
        await elasticService.ingest(spotify.map(episodesAndUsers), indexName)
    }

    console.log("Processing Substack")
    let lastSubstackId = '';
    while (true) {
        const substackUsersAndArticles = await substack.exportArticlesAndUsers(lastSubstackId);
        if (substackUsersAndArticles.length <= 0) break
        lastSubstackId = substackUsersAndArticles[substackUsersAndArticles.length - 1].article_id
        await elasticService.ingest(substack.map(substackUsersAndArticles))
    }

    console.log("Processing Twitter")
    let lastTwitterId = '';
    while (true) {
        const usersAndTweets = await twitter.exportTweetsAndUsers(lastTwitterId);
        if (usersAndTweets.length <= 0) break
        lastTwitterId = usersAndTweets[usersAndTweets.length - 1].tradingpostUserId
        await elasticService.ingest(twitter.map(usersAndTweets))
    }

    await pgp.end();
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