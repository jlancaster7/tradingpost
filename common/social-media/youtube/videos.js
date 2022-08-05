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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidmlkZW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDREQUErQjtBQU0vQixNQUFhLGFBQWE7SUFTdEIsWUFBWSxVQUFzQixFQUFFLGFBQTRCO1FBY2hFLGlCQUFZLEdBQUcsQ0FBTyxTQUFlLEVBQUUsRUFBRTtZQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUM1QyxDQUFDLENBQUEsQ0FBQTtRQUVELGlCQUFZLEdBQUcsQ0FBTyxnQkFBd0IsRUFBRSxFQUFFO1lBQzlDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFBLENBQUE7UUFDRCxxQkFBZ0IsR0FBRyxDQUFPLE1BQWMsRUFBRSxFQUFVLEVBQWtDLEVBQUU7WUFFcEYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMxRSxJQUFJLElBQW1CLENBQUM7WUFFeEIsTUFBTSxhQUFhLEdBQUc7Z0JBQ2xCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRTtvQkFDTCxjQUFjLEVBQUUsa0JBQWtCO2lCQUNyQztnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUztvQkFDdkMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYTtvQkFDL0MsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZO29CQUN2QyxVQUFVLEVBQUUsZUFBZTtp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
