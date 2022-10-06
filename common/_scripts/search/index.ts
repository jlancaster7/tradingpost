import 'dotenv/config';
import pg from 'pg';
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {DefaultConfig} from '../../configuration';
import yargs from "yargs";
import fs from "fs";
import ElasticService from "../../elastic";
import pgPromise from "pg-promise";
import {DefaultYoutube} from "../../social-media/youtube/service";
import PostPrepper from "../../post-prepper";
import {DefaultTwitter} from "../../social-media/twitter/service";
import {DefaultSubstack} from "../../social-media/substack/service";
import {DefaultSpotify} from "../../social-media/spotify/service";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});


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
    const elasticClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration.cloudId as string
        },
        auth: {
            apiKey: elasticConfiguration.apiKey as string
        },
        maxRetries: 5,
    })

    const indexName = "tradingpost-search";
    const elasticService = new ElasticService(elasticClient, indexName);

    const postPrepper = new PostPrepper();

    const youtubeCfg = await DefaultConfig.fromCacheOrSSM("youtube");
    const youtube = DefaultYoutube(youtubeCfg, pgClient, pgp, elasticService);

    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    const twitter = DefaultTwitter(twitterConfiguration, pgClient, pgp, postPrepper, elasticService);

    const substack = DefaultSubstack(pgClient, pgp, postPrepper, elasticService)

    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");
    const spotify = DefaultSpotify(elasticService, pgClient, pgp, spotifyConfiguration)

    const argv = yargs(process.argv.slice(2)).argv;

    // @ts-ignore
    if (argv.scratch) await rebuildElasticIndex(elasticClient, indexName);

    console.log("Processing YouTube")
    let lastYouTubeId: number = 0;
    while (true) {
        const videosAndChannels = await youtube.exportYouTubeVideoAndChannels(lastYouTubeId);
        if (videosAndChannels.length <= 0) break
        lastYouTubeId = videosAndChannels[videosAndChannels.length - 1].id
        await elasticService.ingest(youtube.map(videosAndChannels))
    }

    console.log("Processing Spotify")
    let lastSpotifyEpisodeId = 0;
    while (true) {
        const episodesAndUsers = await spotify.exportEpisodesAndUsers(lastSpotifyEpisodeId);
        if (episodesAndUsers.length <= 0) break
        lastSpotifyEpisodeId = episodesAndUsers[episodesAndUsers.length - 1].id
        await elasticService.ingest(spotify.map(episodesAndUsers))
    }

    console.log("Processing Substack")
    let lastSubstackId = 0;
    while (true) {
        const substackUsersAndArticles = await substack.exportArticlesAndUsers(lastSubstackId);
        if (substackUsersAndArticles.length <= 0) break
        lastSubstackId = substackUsersAndArticles[substackUsersAndArticles.length - 1].id
        await elasticService.ingest(substack.map(substackUsersAndArticles))
    }

    console.log("Processing Twitter")
    let lastTwitterId = 0;
    while (true) {
        const usersAndTweets = await twitter.exportTweetsAndUsers(lastTwitterId);
        if (usersAndTweets.length <= 0) break
        lastTwitterId = usersAndTweets[usersAndTweets.length - 1].id
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
        master_timeout: '120s',
        timeout: '120s',
        settings: {
                
                "max_shingle_diff": 5,
                "analysis": {
                    "filter": {
                        "synonym_filter": {
                            "type": "synonym",
                            "synonyms": synonymList,
                            "updateable": true
                        },
                        "my_shingle_filter": {
                            "type": "shingle",
                            "min_shingle_size": 2,
                            "max_shingle_size": 5
                          }
                    },
                    "tokenizer": {
                        "my_syn_tokenizer": {
                            "type": "pattern",
                            "pattern": ","
                        },
                        "my_pattern_tokenizer":{
                            "type": "pattern",
                            "pattern": "((\\$)\\w*)|(\\w*)",
                            "group": 0,
                            "lowercase": true
                            
                          }
                    },
                    "analyzer": {
                        // @ts-ignore
                        "synonym_analyzer": {
                            "tokenizer": "my_syn_tokenizer",
                            "filter": ["synonym_filter", "lowercase"]
                        },
                        "default": {
                            "tokenizer": "my_pattern_tokenizer",
                            "filter": ["my_shingle_filter", "lowercase"]
                        },
                        "default_search": {
                            "type": "whitespace"
                        }
                    }
                }
            }
        }
    );
}

(async () => {
    await run();
})()
