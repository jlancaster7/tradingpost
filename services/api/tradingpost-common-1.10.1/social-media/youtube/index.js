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
const node_fetch_1 = __importDefault(require("node-fetch"));
class YouTube {
    constructor(repository, cfg) {
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
                    client_id: this.youtubeCfg.client_id,
                    client_secret: this.youtubeCfg.client_secret,
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
                claims: response[0].claims || { handle: '' },
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
            let key = (accessToken ? accessToken : this.youtubeCfg.api_key);
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
                            channelParams.append('key', this.youtubeCfg.api_key);
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
                        channelParams.append('key', this.youtubeCfg.api_key);
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
                formatedVideos[i].aspect_ratio = 1.0;
                formatedVideos[i].max_width = 400.0;
            }
            return formatedVideos;
        };
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
                    claims: {
                        handle: d.title
                    },
                    updatedAt: new Date()
                });
            }
            formatedData = this.formatChannelInfo(data);
            const dummyTokens = yield this.repository.getTokens('platform_user_id', out.map(a => a.platformUserId), 'youtube');
            if (dummyTokens !== null && dummyTokens.length > 0 && !dummyTokens.map(a => a.userId).includes(youtubeUsers.userId)) {
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
        this.disconnectYoutubeUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            const platform = 'youtube';
            const authUrl = 'https://oauth2.googleapis.com/revoke';
            const tokens = yield this.repository.getTokens('user_id', [userId], platform);
            const params = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: tokens[0].refreshToken
                })
            };
            const response = yield (0, node_fetch_1.default)(authUrl, params);
            console.log(yield response.json());
            yield this.repository.removeUserToken('user_id', userId, platform);
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
                        key: this.youtubeCfg.api_key,
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
                    key: this.youtubeCfg.api_key,
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
                        key: this.youtubeCfg.api_key,
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
        this.repository = repository;
        this.youtubeCfg = cfg;
        this.youtubeUrl = "https://www.googleapis.com/youtube/v3";
        this.standardYtUrl = 'https://www.youtube.com/channel/';
        this.customYtUrl = 'https://www.youtube.com/c/';
        this.params = {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        };
        this.startDate = '';
        this.defaultStartDateDays = 90;
    }
}
exports.default = YouTube;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUdBLDREQUErQjtBQUUvQixNQUFxQixPQUFPO0lBVXhCLFlBQVksVUFBc0IsRUFBRSxHQUFrQjtRQWdCdEQsaUJBQVksR0FBRyxDQUFPLFNBQWUsRUFBRSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQzVDLENBQUMsQ0FBQSxDQUFBO1FBRUQsaUJBQVksR0FBRyxDQUFPLGdCQUF3QixFQUFFLEVBQUU7WUFDOUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUEsQ0FBQTtRQUVELHFCQUFnQixHQUFHLENBQU8sTUFBYyxFQUFFLEVBQVUsRUFBaUMsRUFBRTtZQUNuRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQUksSUFBbUIsQ0FBQztZQUV4QixNQUFNLGFBQWEsR0FBRztnQkFDbEIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFO29CQUNMLGNBQWMsRUFBRSxrQkFBa0I7aUJBQ3JDO2dCQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTO29CQUNwQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhO29CQUM1QyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVk7b0JBQ3ZDLFVBQVUsRUFBRSxlQUFlO2lC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