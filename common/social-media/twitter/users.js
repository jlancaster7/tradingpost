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
    constructor(twitterConfig, repository) {
        this.refreshTokensbyId = (userIds) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.repository.getTokens(userIds, 'twitter');
                const authUrl = '/oauth2/token';
                let data = [];
                for (let d of response) {
                    const refreshParams = {
                        method: 'POST',
                        headers: {
                            "content-type": 'application/x-www-form-urlencoded'
                        },
                        form: {
                            refresh_token: d.claims.refresh_token,
                            grant_type: 'refresh_token',
                            client_id: this.twitterConfig.clientId
                        }
                    };
                    const fetchUrl = this.twitterUrl + authUrl;
                    const response = (yield (yield (0, node_fetch_1.default)(fetchUrl, refreshParams)).json()).data;
                    data.push({ userId: d.user_id, platform: d.platform, platformUserId: d.platform_user_id, accessToken: response.access_token, refreshToken: response.refresh_token, expiration: response.expires_in });
                }
                yield this.repository.upsertUserTokens(data);
            }
            catch (err) {
                console.error(err);
            }
        });
        this.importUserByToken = (twitterUsers) => __awaiter(this, void 0, void 0, function* () {
            let data = [];
            let out = [];
            let temp;
            for (let d of twitterUsers) {
                temp = yield this.getUserInfoByToken(d.accessToken);
                if (!temp) {
                    yield this.refreshTokensbyId([d.userId]);
                    temp = yield this.getUserInfoByToken(d.accessToken);
                    if (!temp) {
                        continue;
                    }
                }
                out.push({ userId: d.userId, platform: 'twitter', platformUserId: temp.id, accessToken: d.accessToken, refreshToken: d.refreshToken, expiration: d.expiration });
                data.push(temp);
            }
            if (data === []) {
                return [[], 0];
            }
            const formatedData = this.formatUser(data);
            yield this.repository.upsertUserTokens(out);
            const result = yield this.repository.upsertTwitterUser(formatedData);
            return [formatedData, result];
        });
        this.importUserByHandle = (handles) => __awaiter(this, void 0, void 0, function* () {
            if (typeof handles === 'string') {
                handles = [handles];
            }
            const data = yield this.getUserInfo(handles);
            if (data === []) {
                return [];
            }
            const formatedData = this.formatUser(data);
            const result = yield this.repository.upsertTwitterUser(formatedData);
            return formatedData;
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
        this.formatUser = (rawUsers) => {
            let formatedUsers = [];
            for (let i = 0; i < rawUsers.length; i++) {
                formatedUsers.push({
                    twitter_user_id: rawUsers[i].id,
                    username: rawUsers[i].username,
                    display_name: rawUsers[i].name,
                    description: rawUsers[i].description,
                    profile_url: 'https://www.twitter.com/' + rawUsers[i].username,
                    profile_image_url: rawUsers[i].profile_image_url,
                    location: rawUsers[i].location,
                    protected: rawUsers[i].protected,
                    twitter_created_at: new Date(rawUsers[i].created_at),
                    follower_count: rawUsers[i].public_metrics.followers_count,
                    following_count: rawUsers[i].public_metrics.following_count
                });
            }
            return formatedUsers;
        };
        this.twitterConfig = twitterConfig;
        this.repository = repository;
        //this.pg_client = pg_client;
        //this.pgp = pgp;
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
