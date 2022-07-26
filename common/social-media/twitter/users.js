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
exports.TwitterUsers = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class TwitterUsers {
    constructor(twitterConfig, pg_client, pgp) {
        this.upsertUserToken = (twitterUsers) => __awaiter(this, void 0, void 0, function* () {
            // TODO: add query to upsert token into third-party claims table
        });
        this.importUserByToken = (twitterUsers) => __awaiter(this, void 0, void 0, function* () {
            let data = [];
            let temp;
            for (let d of twitterUsers) {
                temp = yield this.getUserInfoByToken(d.tokens);
                if (temp) {
                    console.log('The following token failed to import: ' + d);
                    continue;
                }
                data.push(temp);
            }
            if (data === []) {
                return [[], 0];
            }
            const formatedData = this.formatUserInfo(data);
            const result = yield this.appendUserInfo(formatedData);
            return [formatedData, result];
        });
        this.importUserByHandle = (handles) => __awaiter(this, void 0, void 0, function* () {
            if (typeof handles === 'string') {
                handles = [handles];
            }
            const data = yield this.getUserInfo(handles);
            if (data === []) {
                return [[], 0];
            }
            const formatedData = this.formatUserInfo(data);
            const result = yield this.appendUserInfo(formatedData);
            return [formatedData, result];
        });
        this.getUserInfo = (handles) => __awaiter(this, void 0, void 0, function* () {
            let data;
            try {
                this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'];
                const userInfoEndpoint = "/users/by?";
                const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                    usernames: handles.join(),
                    "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username",
                });
                const response = yield (0, node_fetch_1.default)(fetchUrl, this.params);
                data = (yield response.json()).data;
                return data;
            }
            catch (err) {
                console.log(err);
                return [];
            }
        });
        this.getUserInfoByToken = (token) => __awaiter(this, void 0, void 0, function* () {
            let data;
            try {
                this.params.headers.authorization = 'BEARER ' + token;
                const userInfoEndpoint = "/users/me?";
                const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                    "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username",
                });
                const response = yield (0, node_fetch_1.default)(fetchUrl, this.params);
                data = (yield response.json()).data;
                return data;
            }
            catch (err) {
                console.log(err);
                return null;
            }
        });
        this.formatUserInfo = (rawUsers) => {
            let formatedUsers = [];
            for (let i = 0; i < rawUsers.length; i++) {
                formatedUsers.push({
                    twitter_user_id: rawUsers[i].id,
                    username: rawUsers[i].username,
                    display_name: rawUsers[i].name,
                    description: rawUsers[i].description,
                    profile_url: 'https://www.twitter.com/' + rawUsers[i].username,
                    profile_img_url: rawUsers[i].profile_img_url,
                    location: rawUsers[i].location,
                    protected: rawUsers[i].protected,
                    twitter_created_at: new Date(rawUsers[i].created_at),
                    follower_count: rawUsers[i].public_metrics.followers_count,
                    following_count: rawUsers[i].public_metrics.following_count
                });
            }
            return formatedUsers;
        };
        this.appendUserInfo = (users) => __awaiter(this, void 0, void 0, function* () {
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
                    { name: 'profile_img_url', prop: 'profile_img_url' },
                    { name: 'profile_url', prop: 'profile_url' },
                    { name: 'twitter_user_id', prop: 'twitter_user_id' },
                ], { table: 'twitter_users' });
                const query = this.pgp.helpers.insert(users, cs) + ` ON CONFLICT DO UPDATE SET
                                                                 display_name = EXCLUDED.display_name,
                                                                 follower_count = EXCLUDED.follower_count,
                                                                 following_count = EXCLUDED.following_count,
                                                                 description = EXCLUDED.description,
                                                                 profile_img_url = EXCLUDED.profile_img_url,
                                                                 profile_url = EXCLUDED.profile_url
                                                                 `;
                const result = yield this.pg_client.result(query);
                return result.rowCount;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
        this.twitterConfig = twitterConfig;
        this.pg_client = pg_client;
        this.pgp = pgp;
        this.twitterUrl = "https://api.twitter.com/2";
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterConfig['bearer_token']
            }
        };
    }
}
exports.TwitterUsers = TwitterUsers;
