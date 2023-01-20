import 'dotenv/config';
import {DefaultConfig} from "../configuration";
import fs from 'fs';
import Repository from '../social-media/repository';
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {PlatformToken} from '../social-media/utils';
import { DefaultTwitter } from '../social-media/twitter/service';
import Substack from '../social-media/substack/index';
import Spotify from '../social-media/spotify/index';
import ElasticService from "../elastic";
import PostPrepper from "../post-prepper";
import {Client as ElasticClient} from '@elastic/elasticsearch';


let pgClient: IDatabase<any>;
let pgp: IMain;

const createDummyAccounts = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        await pgClient.connect()
    }
    const repository = new Repository(pgClient, pgp);
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

    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    const spotifyConfiguration = await DefaultConfig.fromCacheOrSSM("spotify");

    let data: any[] = [];
    
    data = fs.readFileSync('./utils/newDummyAccounts.csv')
        .toString() // convert Buffer to string
        .split('\n') // split string to lines
        .map(e => e.trim()) // remove white spaces for each line
        .map(e => e.split(',').map(e => e.trim()));
     
    
    let users = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === '') continue;
    
        users.push({
            first_name: '',
            last_name: '',
            handle: '__' + data[i][0] + '__',
            email: data[i][0] + '@tradingpost.test',
            profile_url: '',
            settings: {"analyst": false, "portfolio_display": {"trades": false, "holdings": false, "performance": false}, "push_notifications": {"upvotes": false, "mentions": false, "watchlist_changes": false}},
            bio: `This user hasn't claimed their profile yet!`,
            banner_url: '',
            tags: data[i][1] ? data[i][1].split('|') : [],
            dummy: true,
            is_deleted: false,
            has_profile_pic: false

            });
    }
    console.log(users)
    const cs = new pgp.helpers.ColumnSet([
        {name: 'first_name', prop: 'first_name'},
        {name: 'last_name', prop: 'last_name'},
        {name: 'handle', prop: 'handle'},
        {name: 'email', prop: 'email'},
        {name: 'profile_url', prop: 'profile_url'},
        {name: 'settings', prop: 'settings'},
        {name: 'bio', prop: 'bio'},
        {name: 'banner_url', prop: 'banner_url'},
        {name: 'tags', prop: 'tags'},
        {name: 'dummy', prop: 'dummy'},
        {name: 'is_deleted', prop: 'is_deleted'},
        {name: 'has_profile_pic', prop: 'has_profile_pic'}
    ], {table: 'data_user'})
    const query = pgp.helpers.insert(users, cs) + ' ON CONFLICT (handle) DO NOTHING RETURNING id'
    
    const userImportResult: any = await pgClient.result(query);
    console.log(`number of users imported ${userImportResult.rowCount}`)
    const twitter = DefaultTwitter(twitterConfiguration, pgClient, pgp, postPrepper, elasticService);
    const substack = new Substack(repository, postPrepper)
    
    const spotify = new Spotify(repository, spotifyConfiguration);
    console.log(userImportResult.rows)
    for (let i = 1; i < data.length; i++) {
        const userId = userImportResult.rows[i - 1]?.id as string
        if (data[i][0] === '') continue;
        ['twitter', 'substack', 'spotify', 'youtube'].forEach(async (item, j) => {
            if (data[i][j + 2] !== '') {
                if (data[0][j + 2] === 'twitter') {
                    await twitter.addTwitterUsersByHandle(data[i][j + 2])
                }
                else if (data[0][j + 2] === 'substack') {
                    await substack.adminImportUsers(data[i][j + 2])
                }
                else if (data[0][j + 2] === 'spotify') {
                    await spotify.adminImportShows(data[i][j + 2])
                }
                else if (data[0][j + 2] === 'youtube') {

                }
                else return;

                const token: PlatformToken = {
                    userId: userId,
                    platform: item,
                    platformUserId: data[i][j + 2],
                    accessToken: null,
                    refreshToken: null,
                    expiration: null,
                    updatedAt: new Date(),
                    claims: null
                }
                await repository.upsertUserTokens(token);
                console.log(`${data[i][1]}`)
            }
        })
    }

    
    //pgp.end();
}

createDummyAccounts();

const linkDummyAccounts = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        await pgClient.connect()
    }
    const repository = new Repository(pgClient, pgp);
    let data: any[] = [];
    
    data = fs.readFileSync('./utils/newDummyAccountLinks.csv')
        .toString() // convert Buffer to string
        .split('\n') // split string to lines
        .map(e => e.trim()) // remove white spaces for each line
        .map(e => e.split(',').map(e => e.trim()));
     

    
    let tokens: PlatformToken;
    for (let i = 1; i < data.length; i++) {
        if (data[i][2] === '') { continue; }
        tokens = {
            userId: data[i][1],
            platform: 'twitter',
            platformUserId: data[i][2],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        }
        const response = await repository.upsertUserTokens(tokens);
    }

    for (let i = 1; i < data.length; i++) {
        if (data[i][3] === '') { continue; }
        tokens = {
            userId: data[i][1],
            platform: 'substack',
            platformUserId: data[i][3],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        }
        const response = await repository.upsertUserTokens(tokens);
    }

    for (let i = 1; i < data.length; i++) {
        if (data[i][4] === '') { continue; }
        tokens = {
            userId: data[i][1],
            platform: 'spotify',
            platformUserId: data[i][4],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        }
        const response = await repository.upsertUserTokens(tokens);
    }

    for (let i = 1; i < data.length; i++) {
        if (data[i][5] === '') { continue; }
        tokens = {
            userId: data[i][1],
            platform: 'youtube',
            platformUserId: data[i][5],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        }
        const response = await repository.upsertUserTokens(tokens);
    }
    
    pgp.end();
}


//linkDummyAccounts();


