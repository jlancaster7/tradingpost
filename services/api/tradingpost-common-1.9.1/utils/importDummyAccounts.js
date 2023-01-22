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
            tags: data[i][1] ? data[i][1].split('|') : [],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0RHVtbXlBY2NvdW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltcG9ydER1bW15QWNjb3VudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBdUI7QUFDdkIsb0RBQStDO0FBQy9DLDRDQUFvQjtBQUNwQiw0RUFBb0Q7QUFDcEQsNERBQXVEO0FBRXZELDZEQUFpRTtBQUNqRSwyRUFBc0Q7QUFDdEQsMEVBQW9EO0FBQ3BELHlEQUF3QztBQUN4QyxtRUFBMEM7QUFDMUMsMERBQStEO0FBRy9ELElBQUksUUFBd0IsQ0FBQztBQUM3QixJQUFJLEdBQVUsQ0FBQztBQUVmLE1BQU0sbUJBQW1CLEdBQUcsR0FBUyxFQUFFOztJQUNuQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ25CLE1BQU0scUJBQXFCLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3RSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLFFBQVEsR0FBRyxHQUFHLENBQUM7WUFDWCxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtZQUNoQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtZQUNoQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtZQUN4QyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtTQUMzQyxDQUFDLENBQUM7UUFDSCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMzQjtJQUNELE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQWEsQ0FBQztRQUNwQyxLQUFLLEVBQUU7WUFDSCxFQUFFLEVBQUUsb0JBQW9CLENBQUMsT0FBaUI7U0FDN0M7UUFDRCxJQUFJLEVBQUU7WUFDRixNQUFNLEVBQUUsb0JBQW9CLENBQUMsTUFBZ0I7U0FDaEQ7UUFDRCxVQUFVLEVBQUUsQ0FBQztLQUNoQixDQUFDLENBQUE7SUFFRixNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztJQUN2QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGlCQUFjLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksc0JBQVcsRUFBRSxDQUFDO0lBRXRDLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzRSxNQUFNLG9CQUFvQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFM0UsSUFBSSxJQUFJLEdBQVUsRUFBRSxDQUFDO0lBRXJCLElBQUksR0FBRyxZQUFFLENBQUMsWUFBWSxDQUFDLDhCQUE4QixDQUFDO1NBQ2pELFFBQVEsRUFBRSxDQUFDLDJCQUEyQjtTQUN0QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsd0JBQXdCO1NBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLG9DQUFvQztTQUN2RCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFHL0MsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUFFLFNBQVM7UUFFaEMsS0FBSyxDQUFDLElBQUksQ0FBQztZQUNQLFVBQVUsRUFBRSxFQUFFO1lBQ2QsU0FBUyxFQUFFLEVBQUU7WUFDYixNQUFNLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJO1lBQ2hDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsbUJBQW1CO1lBQ3ZDLFdBQVcsRUFBRSxFQUFFO1lBQ2YsUUFBUSxFQUFFLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFDLEVBQUUsb0JBQW9CLEVBQUUsRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFDLEVBQUM7WUFDdE0sR0FBRyxFQUFFLDZDQUE2QztZQUNsRCxVQUFVLEVBQUUsRUFBRTtZQUNkLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDN0MsS0FBSyxFQUFFLElBQUk7WUFDWCxVQUFVLEVBQUUsS0FBSztZQUNqQixlQUFlLEVBQUUsS0FBSztTQUVyQixDQUFDLENBQUM7S0FDVjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDbEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNqQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztRQUN4QyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztRQUN0QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztRQUNoQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztRQUM5QixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztRQUMxQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztRQUNwQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztRQUMxQixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztRQUN4QyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUM1QixFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztRQUM5QixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztRQUN4QyxFQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUM7S0FDckQsRUFBRSxFQUFDLEtBQUssRUFBRSxXQUFXLEVBQUMsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRywrQ0FBK0MsQ0FBQTtJQUU3RixNQUFNLGdCQUFnQixHQUFRLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ3BFLE1BQU0sT0FBTyxHQUFHLElBQUEsd0JBQWMsRUFBQyxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNqRyxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQVEsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFFdEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFPLENBQUMsVUFBVSxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFBLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLDBDQUFFLEVBQVksQ0FBQTtRQUN6RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQUUsU0FBUztRQUNoQyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFPLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN2QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUM5QixNQUFNLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ3hEO3FCQUNJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUU7b0JBQ3BDLE1BQU0sUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDbEQ7cUJBQ0ksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtvQkFDbkMsTUFBTSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUNqRDtxQkFDSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO2lCQUV0Qzs7b0JBQ0ksT0FBTztnQkFFWixNQUFNLEtBQUssR0FBa0I7b0JBQ3pCLE1BQU0sRUFBRSxNQUFNO29CQUNkLFFBQVEsRUFBRSxJQUFJO29CQUNkLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUIsV0FBVyxFQUFFLElBQUk7b0JBQ2pCLFlBQVksRUFBRSxJQUFJO29CQUNsQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO29CQUNyQixNQUFNLEVBQUUsSUFBSTtpQkFDZixDQUFBO2dCQUNELE1BQU0sVUFBVSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTthQUMvQjtRQUNMLENBQUMsQ0FBQSxDQUFDLENBQUE7S0FDTDtJQUdELFlBQVk7QUFDaEIsQ0FBQyxDQUFBLENBQUE7QUFFRCxtQkFBbUIsRUFBRSxDQUFDO0FBRXRCLE1BQU0saUJBQWlCLEdBQUcsR0FBUyxFQUFFO0lBQ2pDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDbkIsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdFLEdBQUcsR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNYLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1lBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1lBQ2hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1NBQzNDLENBQUMsQ0FBQztRQUNILE1BQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzNCO0lBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRCxJQUFJLElBQUksR0FBVSxFQUFFLENBQUM7SUFFckIsSUFBSSxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsa0NBQWtDLENBQUM7U0FDckQsUUFBUSxFQUFFLENBQUMsMkJBQTJCO1NBQ3RDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyx3QkFBd0I7U0FDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsb0NBQW9DO1NBQ3ZELEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUkvQyxJQUFJLE1BQXFCLENBQUM7SUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQUUsU0FBUztTQUFFO1FBQ3BDLE1BQU0sR0FBRztZQUNMLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLFFBQVEsRUFBRSxTQUFTO1lBQ25CLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtZQUNyQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUE7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM5RDtJQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2xDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUFFLFNBQVM7U0FBRTtRQUNwQyxNQUFNLEdBQUc7WUFDTCxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixRQUFRLEVBQUUsVUFBVTtZQUNwQixjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixXQUFXLEVBQUUsSUFBSTtZQUNqQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtZQUNoQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7WUFDckIsTUFBTSxFQUFFLElBQUk7U0FDZixDQUFBO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDOUQ7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFBRSxTQUFTO1NBQUU7UUFDcEMsTUFBTSxHQUFHO1lBQ0wsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsUUFBUSxFQUFFLFNBQVM7WUFDbkIsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsV0FBVyxFQUFFLElBQUk7WUFDakIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ3JCLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQTtRQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzlEO0lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQUUsU0FBUztTQUFFO1FBQ3BDLE1BQU0sR0FBRztZQUNMLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLFFBQVEsRUFBRSxTQUFTO1lBQ25CLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtZQUNyQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUE7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM5RDtJQUVELEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNkLENBQUMsQ0FBQSxDQUFBO0FBR0Qsc0JBQXNCIn0=