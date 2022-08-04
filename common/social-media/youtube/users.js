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
            for (let d of youtubeUsers) {
                temp = yield this.getChannelInfobyToken(d.accessToken);
                if (temp === undefined) {
                    continue;
                }
                temp.forEach(a => data.push(a));
                out.push({ userId: d.userId, platform: 'youtube', platformUserId: temp[0].id, accessToken: d.accessToken, refreshToken: d.refreshToken, expiration: d.expiration });
            }
            formatedData = this.formatChannelInfo(data);
            yield this.repository.upsertUserTokens(out);
            count += yield this.repository.insertChannelInfo(formatedData);
            return [formatedData, count];
        });
        this.getChannelInfobyToken = (token) => __awaiter(this, void 0, void 0, function* () {
            let fetchUrl;
            let response;
            let result = [];
            const channelEndpoint = '/channels?';
            try {
                const channelParams = new URLSearchParams({
                    access_token: token,
                    part: 'snippet,statistics,status',
                    mine: 'true',
                    maxResults: '10'
                });
                fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
                response = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
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
            }
            catch (err) {
                console.error(err);
                return [];
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBK0I7QUFPL0IsTUFBYSxZQUFZO0lBUXJCLFlBQVksVUFBc0IsRUFBRSxhQUE0QjtRQWNoRSwyQkFBc0IsR0FBRyxDQUFPLGNBQXdCLEVBQTRDLEVBQUU7WUFDbEcsSUFBSSxJQUE2QixDQUFDO1lBQ2xDLElBQUksSUFBSSxHQUFrQixFQUFFLENBQUM7WUFDN0IsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksWUFBbUMsQ0FBQztZQUV4QyxLQUFLLElBQUksQ0FBQyxJQUFJLGNBQWMsRUFBRTtnQkFDMUIsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNuQjtZQUNELFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsS0FBSyxJQUFJLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUvRCxPQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQSxDQUFBO1FBQ0QsOEJBQXlCLEdBQUcsQ0FBTyxZQUE2RixFQUE0QyxFQUFFO1lBQzFLLElBQUksSUFBbUIsQ0FBQztZQUN4QixJQUFJLElBQUksR0FBa0IsRUFBRSxDQUFDO1lBQzdCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBb0IsRUFBRSxDQUFDO1lBQzlCLElBQUksWUFBbUMsQ0FBQztZQUV4QyxLQUFLLElBQUksQ0FBQyxJQUFJLFlBQVksRUFBRTtn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