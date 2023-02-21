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
const configuration_1 = require("../configuration");
const fs_1 = __importDefault(require("fs"));
const repository_1 = __importDefault(require("../social-media/repository"));
const pg_promise_1 = __importDefault(require("pg-promise"));
const service_1 = require("../social-media/twitter/service");
const index_1 = __importDefault(require("../social-media/substack/index"));
const index_2 = __importDefault(require("../social-media/spotify/index"));
const elastic_1 = __importDefault(require("../elastic"));
const post_prepper_1 = __importDefault(require("../post-prepper"));
const elasticsearch_1 = require("@elastic/elasticsearch");
let pgClient;
let pgp;
const createDummyAccounts = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!pgClient || !pgp) {
        const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        pgp = (0, pg_promise_1.default)({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        yield pgClient.connect();
    }
    const repository = new repository_1.default(pgClient, pgp);
    const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new elasticsearch_1.Client({
        cloud: {
            id: elasticConfiguration.cloudId
        },
        auth: {
            apiKey: elasticConfiguration.apiKey
        },
        maxRetries: 5,
    });
    const indexName = "tradingpost-search";
    const elasticService = new elastic_1.default(elasticClient, indexName);
    const postPrepper = new post_prepper_1.default();
    const twitterConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("twitter");
    const spotifyConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("spotify");
    let data = [];
    data = fs_1.default.readFileSync('./utils/newDummyAccounts.csv')
        .toString() // convert Buffer to string
        .split('\n') // split string to lines
        .map(e => e.trim()) // remove white spaces for each line
        .map(e => e.split(',').map(e => e.trim()));
    let users = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === '')
            continue;
        users.push({
            first_name: '',
            last_name: '',
            handle: '__' + data[i][0] + '__',
            email: data[i][0] + '@tradingpost.test',
            profile_url: '',
            settings: { "analyst": false, "portfolio_display": { "trades": false, "holdings": false, "performance": false }, "push_notifications": { "upvotes": false, "mentions": false, "watchlist_changes": false } },
            bio: `This user hasn't claimed their profile yet!`,
            banner_url: '',
            tags: JSON.stringify(data[i][1] ? data[i][1].split('|') : []),
            dummy: true,
            is_deleted: false,
            has_profile_pic: false
        });
    }
    console.log(users);
    const cs = new pgp.helpers.ColumnSet([
        { name: 'first_name', prop: 'first_name' },
        { name: 'last_name', prop: 'last_name' },
        { name: 'handle', prop: 'handle' },
        { name: 'email', prop: 'email' },
        { name: 'profile_url', prop: 'profile_url' },
        { name: 'settings', prop: 'settings' },
        { name: 'bio', prop: 'bio' },
        { name: 'banner_url', prop: 'banner_url' },
        { name: 'tags', prop: 'tags' },
        { name: 'dummy', prop: 'dummy' },
        { name: 'is_deleted', prop: 'is_deleted' },
        { name: 'has_profile_pic', prop: 'has_profile_pic' }
    ], { table: 'data_user' });
    const query = pgp.helpers.insert(users, cs) + ' ON CONFLICT (handle) DO NOTHING RETURNING id';
    const userImportResult = yield pgClient.result(query);
    console.log(`number of users imported ${userImportResult.rowCount}`);
    const twitter = (0, service_1.DefaultTwitter)(twitterConfiguration, pgClient, pgp, postPrepper, elasticService);
    const substack = new index_1.default(repository, postPrepper);
    const spotify = new index_2.default(repository, spotifyConfiguration);
    console.log(userImportResult.rows);
    for (let i = 1; i < data.length; i++) {
        const userId = (_a = userImportResult.rows[i - 1]) === null || _a === void 0 ? void 0 : _a.id;
        if (data[i][0] === '')
            continue;
        ['twitter', 'substack', 'spotify', 'youtube'].forEach((item, j) => __awaiter(void 0, void 0, void 0, function* () {
            if (data[i][j + 2] !== '') {
                if (data[0][j + 2] === 'twitter') {
                    yield twitter.addTwitterUsersByHandle(data[i][j + 2]);
                }
                else if (data[0][j + 2] === 'substack') {
                    yield substack.adminImportUsers(data[i][j + 2]);
                }
                else if (data[0][j + 2] === 'spotify') {
                    yield spotify.adminImportShows(data[i][j + 2]);
                }
                else if (data[0][j + 2] === 'youtube') {
                }
                else
                    return;
                const token = {
                    userId: userId,
                    platform: item,
                    platformUserId: data[i][j + 2],
                    accessToken: null,
                    refreshToken: null,
                    expiration: null,
                    updatedAt: new Date(),
                    claims: null
                };
                yield repository.upsertUserTokens(token);
                console.log(`${data[i][1]}`);
            }
        }));
    }
    //pgp.end();
});
createDummyAccounts();
const linkDummyAccounts = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!pgClient || !pgp) {
        const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        pgp = (0, pg_promise_1.default)({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        yield pgClient.connect();
    }
    const repository = new repository_1.default(pgClient, pgp);
    let data = [];
    data = fs_1.default.readFileSync('./utils/newDummyAccountLinks.csv')
        .toString() // convert Buffer to string
        .split('\n') // split string to lines
        .map(e => e.trim()) // remove white spaces for each line
        .map(e => e.split(',').map(e => e.trim()));
    let tokens;
    for (let i = 1; i < data.length; i++) {
        if (data[i][2] === '') {
            continue;
        }
        tokens = {
            userId: data[i][1],
            platform: 'twitter',
            platformUserId: data[i][2],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        };
        const response = yield repository.upsertUserTokens(tokens);
    }
    for (let i = 1; i < data.length; i++) {
        if (data[i][3] === '') {
            continue;
        }
        tokens = {
            userId: data[i][1],
            platform: 'substack',
            platformUserId: data[i][3],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        };
        const response = yield repository.upsertUserTokens(tokens);
    }
    for (let i = 1; i < data.length; i++) {
        if (data[i][4] === '') {
            continue;
        }
        tokens = {
            userId: data[i][1],
            platform: 'spotify',
            platformUserId: data[i][4],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        };
        const response = yield repository.upsertUserTokens(tokens);
    }
    for (let i = 1; i < data.length; i++) {
        if (data[i][5] === '') {
            continue;
        }
        tokens = {
            userId: data[i][1],
            platform: 'youtube',
            platformUserId: data[i][5],
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date(),
            claims: null
        };
        const response = yield repository.upsertUserTokens(tokens);
    }
    pgp.end();
});
//linkDummyAccounts();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0RHVtbXlBY2NvdW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltcG9ydER1bW15QWNjb3VudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBdUI7QUFDdkIsb0RBQStDO0FBQy9DLDRDQUFvQjtBQUNwQiw0RUFBb0Q7QUFDcEQsNERBQXVEO0FBRXZELDZEQUFpRTtBQUNqRSwyRUFBc0Q7QUFDdEQsMEVBQW9EO0FBQ3BELHlEQUF3QztBQUN4QyxtRUFBMEM7QUFDMUMsMERBQStEO0FBRy9ELElBQUksUUFBd0IsQ0FBQztBQUM3QixJQUFJLEdBQVUsQ0FBQztBQUVmLE1BQU0sbUJBQW1CLEdBQUcsR0FBUyxFQUFFOztJQUNuQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ25CLE1BQU0scUJBQXFCLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3RSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLFFBQVEsR0FBRyxHQUFHLENBQUM7WUFDWCxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtZQUNoQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtZQUNoQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtZQUN4QyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtTQUMzQyxDQUFDLENBQUM7UUFDSCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMzQjtJQUNELE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQWEsQ0FBQztRQUNwQyxLQUFLLEVBQUU7WUFD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