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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidmlkZW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDREQUErQjtBQU0vQixNQUFhLGFBQWE7SUFTdEIsWUFBWSxVQUFzQixFQUFFLGFBQTRCO1FBY2hFLGlCQUFZLEdBQUcsQ0FBTyxTQUFlLEVBQUUsRUFBRTtZQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUM1QyxDQUFDLENBQUEsQ0FBQTtRQUVELGlCQUFZLEdBQUcsQ0FBTyxnQkFBd0IsRUFBRSxFQUFFO1lBQzlDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFBLENBQUE7UUFDRCxxQkFBZ0IsR0FBRyxDQUFPLE1BQWMsRUFBRSxHQUFhLEVBQTZCLEVBQUU7WUFDbEYsSUFBSTtnQkFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxJQUFJLEdBQW9CLEVBQUUsQ0FBQztnQkFFL0IsS0FBSyxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7b0JBQ3BCLE1BQU0sYUFBYSxHQUFHO3dCQUNsQixNQUFNLEVBQUUsTUFBTTt3QkFDZCxPQUFPLEVBQUU7NEJBQ0wsY0FBYyxFQUFFLG1DQUFtQzt5QkFDdEQ7d0JBQ0QsSUFBSSxFQUFFOzRCQUNGLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVM7NEJBQ3ZDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWE7NEJBQy9DLGFB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