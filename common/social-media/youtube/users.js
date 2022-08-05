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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBK0I7QUFPL0IsTUFBYSxZQUFZO0lBUXJCLFlBQVksVUFBc0IsRUFBRSxhQUE0QjtRQWNoRSwyQkFBc0IsR0FBRyxDQUFPLGNBQXdCLEVBQTRDLEVBQUU7WUFDbEcsSUFBSSxJQUE2QixDQUFDO1lBQ2xDLElBQUksSUFBSSxHQUFrQixFQUFFLENBQUM7WUFDN0IsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksWUFBbUMsQ0FBQztZQUV4QyxLQUFLLElBQUksQ0FBQyxJQUFJLGNBQWMsRUFBRTtnQkFDMUIsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNuQjtZQUNELFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsS0FBSyxJQUFJLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUvRCxPQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQSxDQUFBO1FBQ0QsOEJBQXlCLEdBQUcsQ0FBTyxZQUE2RixFQUE0QyxFQUFFO1lBQzFLLElBQUksSUFBbUIsQ0FBQztZQUN4QixJQUFJLElBQUksR0FBa0IsRUFBRSxDQUFDO1lBQzdCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBb0IsRUFBRSxDQUFDO1lBQzlCLElBQUksWUFBbUMsQ0FBQztZQUV4QyxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFC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