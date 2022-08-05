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
        this.refreshTokensbyId = (idType, id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.repository.getTokens(idType, [id], 'twitter');
                const authUrl = '/oauth2/token';
                let data;
                const refreshParams = {
                    method: 'POST',
                    headers: {
                        "content-type": 'application/x-www-form-urlencoded'
                    },
                    form: {
                        refresh_token: response[0].refreshToken,
                        grant_type: 'refresh_token',
                        client_id: this.twitterConfig.clientId
                    }
                };
                const fetchUrl = this.twitterUrl + authUrl;
                const result = (yield (yield (0, node_fetch_1.default)(fetchUrl, refreshParams)).json()).data;
                const expiration = new Date();
                if (!result) {
                    null;
                }
                data = {
                    userId: response[0].userId,
                    platform: response[0].platform,
                    platformUserId: response[0].platformUserId,
                    accessToken: result.access_token,
                    refreshToken: result.refresh_token,
                    expiration: new Date(expiration.getTime() + result.expires_in),
                    updatedAt: new Date()
                };
                yield this.repository.upsertUserTokens(data);
                return data;
            }
            catch (err) {
                console.error(err);
                return null;
            }
        });
        this.importUserByToken = (twitterUser) => __awaiter(this, void 0, void 0, function* () {
            let data;
            let token;
            data = yield this.getUserInfoByToken(twitterUser.accessToken);
            if (!data) {
                const newToken = yield this.refreshTokensbyId('user_id', twitterUser.userId);
                if (!newToken) {
                    throw new Error(`Failed to import user for user id: ${twitterUser.userId}`);
                }
                data = yield this.getUserInfoByToken(twitterUser.accessToken);
                if (!data) {
                    throw new Error("Twitter API failed");
                }
            }
            const expiration = new Date();
            token = { userId: twitterUser.userId,
                platform: 'twitter',
                platformUserId: data.id,
                accessToken: twitterUser.accessToken,
                refreshToken: twitterUser.refreshToken,
                expiration: new Date(expiration.getTime() + twitterUser.expiration),
                updatedAt: new Date()
            };
            const formatedData = this.formatUser([data])[0];
            let dummyTokens = (yield this.repository.getTokens('platform_user_id', [token.platformUserId], 'twitter'));
            if (dummyTokens.length && twitterUser.userId !== dummyTokens[0].userId) {
                const dummyCheck = yield this.repository.isUserIdDummy(dummyTokens[0].userId);
                if (dummyCheck) {
                    yield this.repository.mergeDummyAccounts({ newUserId: twitterUser.userId, dummyUserId: dummyTokens[0].userId });
                }
                else {
                    throw new Error("This account is claimed by another non-dummy user.");
                }
            }
            yield this.repository.upsertUserTokens(token);
            const result = yield this.repository.upsertTwitterUser([formatedData]);
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
                    "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username"
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
