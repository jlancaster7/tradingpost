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
exports.DefaultYoutube = void 0;
const repository_1 = __importDefault(require("../repository"));
const _1 = __importDefault(require("./"));
class YouTubeService {
    constructor(client, repository, elasticSrv) {
        this.import = () => __awaiter(this, void 0, void 0, function* () {
            const channelIds = yield this.repository.getYoutubeUsers();
            let videoIds = [];
            for (let i = 0; i < channelIds.length; i++) {
                try {
                    const [results] = yield this.client.importVideos(channelIds[i].youtube_channel_id, channelIds[i].access_token, channelIds[i].refresh_token);
                    results.forEach(result => videoIds.push(result.video_id));
                }
                catch (err) {
                    console.error(err);
                }
            }
            if (videoIds.length <= 0)
                return;
            const videosAndChannels = yield this.repository.getYoutubeVideosAndChannelsByVideoIds(videoIds);
            yield this.elasticSrv.ingest(this.map(videosAndChannels));
        });
        this.exportYouTubeVideoAndChannels = (lastId) => __awaiter(this, void 0, void 0, function* () {
            return this.repository.getYoutubeVideosAndChannelsById(lastId);
        });
        this.map = (items) => {
            return items.map((yv) => {
                let obj = {
                    id: `youtube_${yv.video_id}`,
                    content: {
                        body: yv.description,
                        description: yv.description,
                        htmlBody: null,
                        htmlTitle: null,
                        title: yv.title
                    },
                    imageUrl: null,
                    meta: {},
                    platform: {
                        displayName: yv.channel_title,
                        imageUrl: null,
                        profileUrl: yv.custom_channel_url,
                        username: null
                    },
                    platformCreatedAt: yv.youtube_created_at.toISO(),
                    platformUpdatedAt: yv.youtube_created_at.toISO(),
                    postType: "youtube",
                    subscription_level: "standard",
                    postTypeValue: 3,
                    postUrl: yv.video_url,
                    ratingsCount: 0,
                    tradingpostCreatedAt: yv.trading_post_youtube_video_created_at.toISO(),
                    tradingpostUpdatedAt: yv.trading_post_youtube_video_created_at.toISO(),
                    user: {
                        id: yv.tradingpostUserId,
                        imageUrl: yv.tradingpostUserProfileUrl,
                        name: "",
                        type: "",
                        username: yv.tradingpostUserHandle
                    },
                    size: {
                        maxWidth: yv.maxWidth,
                        aspectRatio: yv.aspectRatio
                    }
                };
                return obj;
            });
        };
        this.importUsersById = (userChannelUrl) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.importYoutubeUsersById(userChannelUrl);
            let length = userChannelUrl.length;
            if (typeof userChannelUrl === 'string')
                length = 1;
            console.log(`Successfully imported ${result[1]} of ${length} Youtube profiles.`);
            return result;
        });
        this.importUsersByToken = (youtubeUsers) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.importYoutubeUsersbyToken(youtubeUsers);
            console.log(`Successfully imported ${result[0][0].title} Youtube profile.`);
            return result;
        });
        this.importVideos = (pgClient, pgp, youtubeConfiguration, youtubeChannelId, startDate) => __awaiter(this, void 0, void 0, function* () {
            if (startDate !== undefined) {
                yield this.client.setStartDate(startDate);
            }
            const result = yield this.client.importVideos(youtubeChannelId);
            console.log(`${result[1]} Youtube videos were imported!`);
            return result;
        });
        this.repository = repository;
        this.elasticSrv = elasticSrv;
        this.client = client;
    }
}
exports.default = YouTubeService;
const DefaultYoutube = (cfg, pgClient, pgp, elasticSrv) => {
    const repo = new repository_1.default(pgClient, pgp);
    const client = new _1.default(repo, cfg);
    return new YouTubeService(client, repo, elasticSrv);
};
exports.DefaultYoutube = DefaultYoutube;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBT0EsK0RBQXVDO0FBRXZDLDBDQUF5QjtBQVN6QixNQUFxQixjQUFjO0lBSy9CLFlBQVksTUFBZSxFQUFFLFVBQXNCLEVBQUUsVUFBMEI7UUFNL0UsV0FBTSxHQUFHLEdBQXdCLEVBQUU7WUFDL0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzNELElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztZQUU1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsSUFBSTtvQkFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzVJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO2lCQUM1RDtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN0QjthQUNKO1lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsT0FBTTtZQUVoQyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQ0FBcUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRyxNQUFNLElBQUksQ0FB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