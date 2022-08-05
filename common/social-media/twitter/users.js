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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBK0I7QUFNL0IsTUFBYSxZQUFZO0lBT3JCLFlBQVksYUFBNEIsRUFBRSxVQUFzQjtRQWFoRSxzQkFBaUIsR0FBRyxDQUFPLE1BQWMsRUFBRSxFQUFVLEVBQWlDLEVBQUU7WUFDcEYsSUFBSTtnQkFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMxRSxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7Z0JBQ2hDLElBQUksSUFBbUIsQ0FBQztnQkFFeEIsTUFBTSxhQUFhLEdBQUc7b0JBQ2xCLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRTt3QkFDTCxjQUFjLEVBQUUsbUNBQW1DO3FCQUN0RDtvQkFDRCxJQUFJLEVBQUU7d0JBQ0YsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZO3dCQUN2QyxVQUFVLEVBQUUsZUFBZTt3QkFDM0IsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUTtxQkFDekM7aUJBQ0osQ0FBQTtnQkFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztnQkFDM0MsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFBLG9CQUFLLEVBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBRTFFLE1BQU0sVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQUMsSUFBSSxDQUFDO2lCQUFDO2dCQUNwQixJQUFJLEdBQUc7b0JBQ0gsTUFB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
