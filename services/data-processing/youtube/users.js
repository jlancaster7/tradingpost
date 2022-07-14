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
exports.YoutubeUsers = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const pg_format_1 = __importDefault(require("pg-format"));
class YoutubeUsers {
    constructor(youtubeConfig, pg_client) {
        this.importYoutubeUsers = (userChannelUrl) => __awaiter(this, void 0, void 0, function* () {
            if (typeof userChannelUrl === 'string') {
                userChannelUrl = [userChannelUrl];
            }
            ;
            let results = [];
            let data;
            let count = 0;
            let formatedData;
            for (let i = 0; i < userChannelUrl.length; i++) {
                data = yield this.getChannelInfobyUrl(userChannelUrl[i]);
                if (data === undefined) {
                    continue;
                }
                formatedData = this.formatChannelInfo(data);
                count += yield this.appendChannelInfo(formatedData);
                results.push(formatedData);
            }
            return [results, count];
        });
        this.getChannelInfobyUrl = (userChannelUrl) => __awaiter(this, void 0, void 0, function* () {
            let customChannelName;
            let fetchUrl;
            let response;
            const channelEndpoint = '/channels?';
            const searchEndpoint = "/search?";
            try {
                if (userChannelUrl.includes(this.standardYtUrl)) {
                    const channelId = userChannelUrl.replace(this.standardYtUrl, '');
                    const channelParams = new URLSearchParams({
                        key: this.youtubeConfig.api_key,
                        part: 'snippet,statistics,status',
                        id: channelId,
                        maxResults: '10',
                    });
                    fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
                    response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                    let dataOutput = {
                        id: response.items[0].id,
                        title: response.items[0].snippet.title,
                        description: response.items[0].snippet.description,
                        country: response.items[0].snippet.country,
                        customUrl: response.items[0].snippet.customUrl,
                        publishedAt: new Date(response.items[0].snippet.publishedAt),
                        thumbnails: response.items[0].snippet.thumbnails,
                        statistics: response.items[0].statistics,
                        status: response.items[0].status
                    };
                    return dataOutput;
                }
                else if (userChannelUrl.includes(this.customYtUrl)) {
                    customChannelName = userChannelUrl.replace(this.customYtUrl, '').toLowerCase();
                }
                else {
                    console.log('Invalid Youtube URL');
                    return undefined;
                }
                const searchParams = new URLSearchParams({
                    key: this.youtubeConfig.api_key,
                    q: customChannelName,
                    part: 'id',
                    type: 'channel',
                    maxResults: '10'
                });
                fetchUrl = this.youtubeUrl + searchEndpoint + searchParams;
                response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                const data = response.items;
                for (let i = 0; i < data.length; i++) {
                    const channelParams = new URLSearchParams({
                        key: this.youtubeConfig.api_key,
                        part: 'snippet,statistics,status',
                        id: data[i].id.channelId,
                        maxResults: '10',
                    });
                    fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
                    response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                    if (response.items[0].snippet.customUrl === customChannelName) {
                        let dataOutput = {
                            id: response.items[0].id,
                            title: response.items[0].snippet.title,
                            description: response.items[0].snippet.description,
                            country: response.items[0].snippet.country,
                            customUrl: response.items[0].snippet.customUrl,
                            publishedAt: new Date(response.items[0].snippet.publishedAt),
                            thumbnails: response.items[0].snippet.thumbnails,
                            statistics: response.items[0].statistics,
                            status: response.items[0].status
                        };
                        return dataOutput;
                    }
                }
                console.log('Could not find Channel ID based on the channel profile URL provided');
                return undefined;
            }
            catch (err) {
                console.log(err);
                return undefined;
            }
        });
        this.formatChannelInfo = (data) => {
            let formatedChannel = JSON.parse(JSON.stringify(data));
            formatedChannel.youtube_channel_id = data.id;
            delete formatedChannel.id;
            formatedChannel.custom_url = data.customUrl;
            delete formatedChannel.customUrl;
            formatedChannel.youtube_created_at = data.publishedAt;
            delete formatedChannel.publishedAt;
            return formatedChannel;
        };
        this.appendChannelInfo = (data) => __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            let query;
            let result;
            let keys;
            let values = [];
            try {
                keys = Object.keys(data).join(' ,');
                values = Object.values(data);
                query = `INSERT INTO youtube_users(${keys}) VALUES %L ON CONFLICT (youtube_channel_id) DO NOTHING`;
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                result = yield this.pg_client.query((0, pg_format_1.default)(query, values));
                success += result.rowCount;
            }
            catch (err) {
                console.log(err);
            }
            return success;
        });
        this.youtubeConfig = youtubeConfig;
        this.pg_client = pg_client;
        this.youtubeUrl = "https://www.googleapis.com/youtube/v3";
        this.standardYtUrl = 'https://www.youtube.com/channel/';
        this.customYtUrl = 'https://www.youtube.com/c/';
        this.params = {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        };
    }
}
exports.YoutubeUsers = YoutubeUsers;