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
        this.refreshTokensbyId = (idType, ids) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.repository.getTokens(idType, ids, 'twitter');
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
                    if (!response) {
                        continue;
                    }
                    data.push({
                        userId: d.user_id,
                        platform: d.platform,
                        platformUserId: d.platform_user_id,
                        accessToken: response.access_token,
                        refreshToken: response.refresh_token,
                        expiration: response.expires_in
                    });
                }
                yield this.repository.upsertUserTokens(data);
                return data;
            }
            catch (err) {
                console.error(err);
                return [];
            }
        });
        this.importUserByToken = (twitterUsers) => __awaiter(this, void 0, void 0, function* () {
            let data = [];
            let out = [];
            let temp;
            for (let d of twitterUsers) {
                temp = yield this.getUserInfoByToken(d.accessToken);
                if (!temp) {
                    yield this.refreshTokensbyId('user_id', [d.userId]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBK0I7QUFNL0IsTUFBYSxZQUFZO0lBT3JCLFlBQVksYUFBNEIsRUFBRSxVQUFzQjtRQWFoRSxzQkFBaUIsR0FBRyxDQUFPLE1BQWMsRUFBRSxHQUFhLEVBQTRCLEVBQUU7WUFDbEYsSUFBSTtnQkFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQztnQkFDaEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNkLEtBQUssSUFBSSxDQUFDLElBQUksUUFBUSxFQUFFO29CQUNwQixNQUFNLGFBQWEsR0FBRzt3QkFDbEIsTUFBTSxFQUFFLE1BQU07d0JBQ2QsT0FBTyxFQUFFOzRCQUNMLGNBQWMsRUFBRSxtQ0FBbUM7eUJBQ3REO3dCQUNELElBQUksRUFBRTs0QkFDRixhQUFhLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhOzRCQUNyQyxVQUFVLEVBQUUsZUFBZTs0QkFDM0IsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUTt5QkFDekM7cUJBQ0osQ0FBQTtvQkFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztvQkFDM0MsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFBLG9CQUFLLEVBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQzVFLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBQUMsU0FBUztxQkFBQztvQkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDTixNQUFNLEVBQUUs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