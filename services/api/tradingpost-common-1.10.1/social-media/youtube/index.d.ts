import Repository from "../repository";
import { youtubeConfig, PlatformToken } from '../utils';
import { channelInfo, formatedChannelInfo, formatedYoutubeVideo, rawYoutubeVideo } from "./interfaces";
export default class YouTube {
    private repository;
    private youtubeCfg;
    private readonly youtubeUrl;
    private readonly standardYtUrl;
    private readonly customYtUrl;
    private params;
    private startDate;
    private defaultStartDateDays;
    constructor(repository: Repository, cfg: youtubeConfig);
    setStartDate: (startDate: Date) => Promise<void>;
    getStartDate: (youtubeChannelId: string) => Promise<void>;
    refreshTokenById: (idType: string, id: string) => Promise<PlatformToken | null>;
    importVideos: (youtubeChannelId: string, accessToken?: string | null, refreshToken?: string | null) => Promise<[formatedYoutubeVideo[], number]>;
    getVideos: (youtubeChannelId: string, accessToken?: string | null, refreshToken?: string | null) => Promise<rawYoutubeVideo[]>;
    formatVideos: (rawVideos: rawYoutubeVideo[]) => formatedYoutubeVideo[];
    importYoutubeUsersById: (userChannelUrl: string[]) => Promise<[formatedChannelInfo[], number]>;
    importYoutubeUsersbyToken: (youtubeUsers: {
        userId: string;
        accessToken: string;
        refreshToken: string;
        expiration: number;
    }) => Promise<[formatedChannelInfo[], number]>;
    disconnectYoutubeUser: (userId: string) => Promise<void>;
    getChannelInfobyToken: (userId: string, token: string) => Promise<channelInfo[]>;
    getChannelInfobyUrl: (userChannelUrl: string) => Promise<channelInfo | undefined>;
    formatChannelInfo: (data: channelInfo[]) => formatedChannelInfo[];
}
