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
        this.refreshTokenById = (idType, ids) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.repository.getTokens(idType, ids, 'youtube');
                const authUrl = '';
                let data = [];
                for (let d of response) {
                    const refreshParams = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        form: {
                            client_id: this.youtubeConfig.client_id,
                            client_secret: this.youtubeConfig.client_secret,
                            refresh_token: d.refresh_token,
                            grant_type: 'refresh_token'
                        }
                    };
                    const fetchUrl = 'https://oauth2.googleapis.com/token';
                    const response = (yield (yield (0, node_fetch_1.default)(fetchUrl, refreshParams)).json());
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
            try {
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
                    if (accessToken && !items.length) {
                        const newTokens = yield this.refreshTokenById('platform_user_id', [youtubeChannelId]);
                        channelParams.set('access_token', newTokens[0].accessToken);
                        response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                        items = response.items;
                        if (!items.length) {
                            channelParams.delete('access_token');
                            channelParams.append('key', this.youtubeConfig.api_key);
                            response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                            items = response.items;
                            if (!items.length) {
                                return [];
                            }
                        }
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
            }
            catch (e) {
                console.log(e);
                throw e;
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
