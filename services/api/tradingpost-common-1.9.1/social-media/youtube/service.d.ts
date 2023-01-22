import { formatedYoutubeVideo, formatedChannelInfo, YouTubeVideoAndChannel, YouTubeVideoAndChannelTable } from './interfaces';
import { IDatabase, IMain } from "pg-promise";
import Repository from '../repository';
import ElasticService from "../../elastic";
import YouTube from "./";
import { SearchBody } from "../../models/elastic/search";
type YoutubeConfiguration = {
    api_key: string;
    client_id: string;
    client_secret: string;
};
export default class YouTubeService {
    private client;
    private elasticSrv;
    private repository;
    constructor(client: YouTube, repository: Repository, elasticSrv: ElasticService);
    import: () => Promise<void>;
    exportYouTubeVideoAndChannels: (lastId: number) => Promise<YouTubeVideoAndChannelTable[]>;
    map: (items: YouTubeVideoAndChannel[]) => SearchBody[];
    importUsersById: (userChannelUrl: string[]) => Promise<[formatedChannelInfo[], number]>;
    importUsersByToken: (youtubeUsers: {
        userId: string;
        accessToken: string;
        refreshToken: string;
        expiration: number;
    }) => Promise<[formatedChannelInfo[], number]>;
    importVideos: (pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, youtubeChannelId: string, startDate?: Date) => Promise<[formatedYoutubeVideo[], number]>;
}
export declare const DefaultYoutube: (cfg: YoutubeConfiguration, pgClient: IDatabase<any>, pgp: IMain, elasticSrv: ElasticService) => YouTubeService;
export {};
