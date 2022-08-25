import {
    formatedYoutubeVideo,
    formatedChannelInfo,
    YouTubeVideoAndChannel,
    YouTubeVideoAndChannelTable
} from './interfaces';
import {IDatabase, IMain} from "pg-promise";
import Repository from '../repository';
import ElasticService from "../../elastic";
import YouTube from "./";
import {SearchBody} from "../../models/elastic/search";

type YoutubeConfiguration = {
    api_key: string
    client_id: string
    client_secret: string
}

export default class YouTubeService {
    private client: YouTube;
    private elasticSrv: ElasticService;
    private repository: Repository;

    constructor(client: YouTube, repository: Repository, elasticSrv: ElasticService) {
        this.repository = repository;
        this.elasticSrv = elasticSrv;
        this.client = client;
    }

    import = async (): Promise<void> => {
        const channelIds = await this.repository.getYoutubeUsers();
        let videoIds: string[] = [];

        for (let i = 0; i < channelIds.length; i++) {
            try {
                const [results] = await this.client.importVideos(channelIds[i].youtube_channel_id, channelIds[i].access_token, channelIds[i].refresh_token);
                results.forEach(result => videoIds.push(result.video_id))
            } catch (err) {
                console.error(err);
            }
        }

        if (videoIds.length <= 0) return

        const videosAndChannels = await this.repository.getYoutubeVideosAndChannelsByVideoIds(videoIds);
        await this.elasticSrv.ingest(this.map(videosAndChannels));
    }

    exportYouTubeVideoAndChannels = async (lastId: number): Promise<YouTubeVideoAndChannelTable[]> => {
        return this.repository.getYoutubeVideosAndChannelsById(lastId);
    }

    map = (items: YouTubeVideoAndChannel[]): SearchBody[] => {
        return items.map((yv: YouTubeVideoAndChannel) => {
            let obj: SearchBody = {
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
        })
    }

    importUsersById = async (userChannelUrl: string[]): Promise<[formatedChannelInfo[], number]> => {
        const result = await this.client.importYoutubeUsersById(userChannelUrl);
        let length: number = userChannelUrl.length;
        if (typeof userChannelUrl === 'string') length = 1

        console.log(`Successfully imported ${result[1]} of ${length} Youtube profiles.`);
        return result;
    }

    importUsersByToken = async (youtubeUsers: { userId: string, accessToken: string, refreshToken: string, expiration: number }): Promise<[formatedChannelInfo[], number]> => {
        const result = await this.client.importYoutubeUsersbyToken(youtubeUsers);
        console.log(`Successfully imported ${result[0][0].title} Youtube profile.`);
        return result;
    }

    importVideos = async (pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, youtubeChannelId: string, startDate?: Date): Promise<[formatedYoutubeVideo[], number]> => {
        if (startDate !== undefined) {
            await this.client.setStartDate(startDate);
        }
        const result = await this.client.importVideos(youtubeChannelId);
        console.log(`${result[1]} Youtube videos were imported!`);
        return result;
    }
}

export const DefaultYoutube = (cfg: YoutubeConfiguration, pgClient: IDatabase<any>, pgp: IMain, elasticSrv: ElasticService) => {
    const repo = new Repository(pgClient, pgp);
    const client = new YouTube(repo, cfg);
    return new YouTubeService(client, repo, elasticSrv);
}