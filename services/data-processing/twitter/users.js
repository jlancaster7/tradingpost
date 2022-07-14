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
const pg_format_1 = __importDefault(require("pg-format"));
class TwitterUsers {
    constructor(twitterConfig, pg_client) {
        this.importUser = (handles) => __awaiter(this, void 0, void 0, function* () {
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
        this.formatUserInfo = (rawUsers) => {
            let formatedUsers = JSON.parse(JSON.stringify(rawUsers));
            for (let i = 0; i < rawUsers.length; i++) {
                formatedUsers[i].follower_count = rawUsers[i].public_metrics.followers_count;
                formatedUsers[i].following_count = rawUsers[i].public_metrics.following_count;
                formatedUsers[i].twitter_created_at = new Date(rawUsers[i].created_at);
                formatedUsers[i].twitter_user_id = rawUsers[i].id;
                formatedUsers[i].display_name = rawUsers[i].name;
                formatedUsers[i].profile_url = 'https://www.twitter.com/' + rawUsers[i].username;
                delete formatedUsers[i].name;
                delete formatedUsers[i].created_at;
                delete formatedUsers[i].id;
                delete formatedUsers[i].public_metrics;
            }
            return formatedUsers;
        };
        this.appendUserInfo = (users) => __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            let query;
            let result;
            let keys;
            let values = [];
            try {
                keys = Object.keys(users[0]).join(' ,');
                users.forEach(element => {
                    values.push(Object.values(element));
                });
                query = `INSERT INTO twitter_users(${keys})
            VALUES
            %L
                     ON CONFLICT (twitter_user_id)
            DO NOTHING`;
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                result = yield this.pg_client.result((0, pg_format_1.default)(query, values));
                success += result.rowCount;
            }
            catch (err) {
                console.log(err);
            }
            return success;
        });
        this.twitterConfig = twitterConfig;
        this.pg_client = pg_client;
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
