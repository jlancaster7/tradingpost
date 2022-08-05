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
exports.YoutubeVideos = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class YoutubeVideos {
    constructor(repository, youtubeConfig) {
        this.setStartDate = (startDate) => __awaiter(this, void 0, void 0, function* () {
            this.startDate = startDate.toISOString();
        });
        this.getStartDate = (youtubeChannelId) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repository.getYoutubeLastUpdate(youtubeChannelId);
            this.setStartDate(result);
        });
        this.refreshTokenById = (idType, id) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.repository.getTokens(idType, [id], 'youtube');
            let data;
            const refreshParams = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: this.youtubeConfig.client_id,
                    client_secret: this.youtubeConfig.client_secret,
                    refresh_token: response[0].refreshToken,
                    grant_type: 'refresh_token'
                })
            };
            const fetchUrl = 'https://oauth2.googleapis.com/token';
            const result = (yield (yield (0, node_fetch_1.default)(fetchUrl, refreshParams)).json());
            const today = new Date();
            if (result.error) {
                console.error(`Youtube Token Referesh for idType: ${idType} and id: ${id} failed to refresh`);
                return null;
            }
            data = {
                userId: response[0].userId,
                platform: response[0].platform,
                platformUserId: response[0].platformUserId,
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                expiration: new Date(today.getTime() + result.expires_in),
                updatedAt: new Date()
            };
            yield this.repository.upsertUserTokens(data);
            return data;
        });
        this.importVideos = (youtubeChannelId, accessToken = null, refreshToken = null) => __awaiter(this, void 0, void 0, function* () {
            let data = yield this.getVideos(youtubeChannelId, accessToken, refreshToken);
            if (!data[0]) {
                return [[], 0];
            }
            let formatedData = this.formatVideos(data);
            let result = yield this.repository.insertYoutubeVideos(formatedData);
            return [formatedData, result];
        });
        this.getVideos = (youtubeChannelId, accessToken = null, refreshToken = null) => __awaiter(this, void 0, void 0, function* () {
            if (this.startDate === '') {
                yield this.getStartDate(youtubeChannelId);
            }
            let fetchUrl;
            let channelParams;
            let response;
            const playlistEndpoint = '/activities?';
            let nextToken = '';
            let key = (accessToken ? accessToken : this.youtubeConfig.api_key);
            let data = [];
            let items;
            while (nextToken !== 'end') {
                if (nextToken === '') {
                    channelParams = new URLSearchParams({
                        part: 'id,contentDetails,snippet',
                        channelId: youtubeChannelId,
                        publishedAfter: this.startDate,
                        maxResults: '50',
                    });
                }
                else {
                    channelParams = new URLSearchParams({
                        part: 'id,contentDetails,snippet',
                        channelId: youtubeChannelId,
                        pageToken: nextToken,
                        publishedAfter: this.startDate,
                        maxResults: '50',
                    });
                }
                if (accessToken) {
                    channelParams.append('access_token', key);
                }
                else {
                    channelParams.append('key', key);
                }
                fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                items = response.items;
                if (response.pageInfo && !response.pageInfo.totalResults) {
                    throw new Error(`No videos were return for ${youtubeChannelId}`);
                }
                if (accessToken && !items) {
                    const newTokens = yield this.refreshTokenById('platform_user_id', youtubeChannelId);
                    if (newTokens) {
                        channelParams.set('access_token', newTokens.accessToken);
                        fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                        response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                        items = response.items;
                        if (!items) {
                            channelParams.delete('access_token');
                            channelParams.append('key', this.youtubeConfig.api_key);
                            fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                            items = response.items;
                            if (!items) {
                                throw new Error(`Was unable to get videos using API key or accessToken ${youtubeChannelId}`);
                            }
                        }
                    }
                    else {
                        channelParams.delete('access_token');
                        channelParams.append('key', this.youtubeConfig.api_key);
                        fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                        response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                        items = response.items;
                        if (!items) {
                            throw new Error(`Was unable to get videos using API key or accessToken ${youtubeChannelId}`);
                        }
                        if (response.pageInfo && !response.pageInfo.totalResults) {
                            throw new Error(`No videos were return for ${youtubeChannelId}`);
                        }
                    }
                }
                else if (!items) {
                    throw new Error(`No videos were return for ${youtubeChannelId}`);
                }
                items.forEach((element) => {
                    if (element.snippet.type === 'upload') {
                        data.push(element);
                    }
                });
                if (Object.keys(response).includes('nextPageToken')) {
                    nextToken = response.nextPageToken;
                }
                else {
                    nextToken = 'end';
                }
            }
            this.startDate = '';
            return data;
        });
        this.formatVideos = (rawVideos) => {
            let formatedVideos = JSON.parse(JSON.stringify(rawVideos));
            for (let i = 0; i < rawVideos.length; i++) {
                formatedVideos[i].video_id = rawVideos[i].contentDetails.upload.videoId;
                delete formatedVideos[i].contentDetails;
                formatedVideos[i].youtube_created_at = rawVideos[i].snippet.publishedAt;
                formatedVideos[i].youtube_channel_id = rawVideos[i].snippet.channelId;
                formatedVideos[i].title = rawVideos[i].snippet.title;
                formatedVideos[i].description = rawVideos[i].snippet.description;
                formatedVideos[i].thumbnails = JSON.stringify(rawVideos[i].snippet.thumbnails);
                delete formatedVideos[i].snippet;
                formatedVideos[i].video_url = 'https://www.youtube.com/watch?v=' + formatedVideos[i].video_id;
                formatedVideos[i].video_embed = 'https://www.youtube.com/embed/' + formatedVideos[i].video_id;
                delete formatedVideos[i].kind;
                delete formatedVideos[i].etag;
                delete formatedVideos[i].id;
            }
            return formatedVideos;
        };
        this.youtubeConfig = youtubeConfig;
        this.repository = repository;
        this.youtubeUrl = "https://www.googleapis.com/youtube/v3";
        this.startDate = '';
        this.defaultStartDateDays = 90;
        this.params = {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        };
    }
}
exports.YoutubeVideos = YoutubeVideos;
