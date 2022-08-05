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
class YoutubeUsers {
    constructor(repository, youtubeConfig) {
        this.importYoutubeUsersById = (userChannelUrl) => __awaiter(this, void 0, void 0, function* () {
            let temp;
            let data = [];
            let count = 0;
            let formatedData;
            for (let d of userChannelUrl) {
                temp = yield this.getChannelInfobyUrl(d);
                if (temp === undefined) {
                    continue;
                }
                data.push(temp);
            }
            formatedData = this.formatChannelInfo(data);
            count += yield this.repository.insertChannelInfo(formatedData);
            return [formatedData, count];
        });
        this.importYoutubeUsersbyToken = (youtubeUsers) => __awaiter(this, void 0, void 0, function* () {
            let temp;
            let data = [];
            let count = 0;
            let out = [];
            let formatedData;
            temp = yield this.getChannelInfobyToken(youtubeUsers.userId, youtubeUsers.accessToken);
            const expiration = new Date();
            for (let d of temp) {
                data.push(d);
                out.push({
                    userId: youtubeUsers.userId,
                    platform: 'youtube',
                    platformUserId: d.id,
                    accessToken: youtubeUsers.accessToken,
                    refreshToken: youtubeUsers.refreshToken,
                    expiration: new Date(expiration.getTime() + youtubeUsers.expiration),
                    updatedAt: new Date()
                });
            }
            formatedData = this.formatChannelInfo(data);
            const dummyTokens = yield this.repository.getTokens('platform_user_id', out.map(a => a.platformUserId), 'youtube');
            if (dummyTokens !== [] && !dummyTokens.map(a => a.userId).includes(youtubeUsers.userId)) {
                for (let d of dummyTokens) {
                    const dummyCheck = yield this.repository.isUserIdDummy(d.userId);
                    if (!dummyCheck) {
                        throw new Error("One of the channels on this user is claimed by another non-dummy user.");
                    }
                }
            }
            for (let d of out) {
                const temp = dummyTokens.find((a) => a.platformUserId === d.platformUserId);
                if (!temp) {
                    yield this.repository.upsertUserTokens(d);
                }
                else {
                    yield this.repository.upsertUserTokens(d);
                    yield this.repository.mergeDummyAccounts({ newUserId: d.userId, dummyUserId: temp.userId });
                }
            }
            count += yield this.repository.insertChannelInfo(formatedData);
            return [formatedData, count];
        });
        this.getChannelInfobyToken = (userId, token) => __awaiter(this, void 0, void 0, function* () {
            let fetchUrl;
            let response;
            let result = [];
            const channelEndpoint = '/channels?';
            const channelParams = new URLSearchParams({
                access_token: token,
                part: 'snippet,statistics,status',
                mine: 'true',
                maxResults: '10'
            });
            fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
            if (!response.pageInfo.totalResults) {
                throw new Error(`No channel exists for this Google account for userId: ${userId}`);
            }
            for (let i = 0; i < response.items.length; i++) {
                result.push({
                    id: response.items[0].id,
                    title: response.items[0].snippet.title,
                    description: response.items[0].snippet.description,
                    country: response.items[0].snippet.country,
                    customUrl: response.items[0].snippet.customUrl,
                    publishedAt: new Date(response.items[0].snippet.publishedAt),
                    thumbnails: response.items[0].snippet.thumbnails,
                    statistics: response.items[0].statistics,
                    status: response.items[0].status
                });
            }
            return result;
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
                    return {
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
                        return {
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
            let formatedChannel = [];
            for (let d of data) {
                formatedChannel.push({
                    youtube_channel_id: d.id,
                    title: d.title,
                    description: d.description,
                    country: d.country,
                    custom_url: d.customUrl,
                    youtube_created_at: d.publishedAt,
                    thumbnails: d.thumbnails,
                    statistics: d.statistics,
                    status: d.status
                });
            }
            return formatedChannel;
        };
        this.youtubeConfig = youtubeConfig;
        this.repository = repository;
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
