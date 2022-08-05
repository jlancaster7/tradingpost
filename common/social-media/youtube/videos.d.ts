import { rawYoutubeVideo, formatedYoutubeVideo } from '../interfaces/youtube';
import { youtubeConfig, PlatformToken } from '../interfaces/utils';
import Repository from '../repository';
export declare class YoutubeVideos {
    private youtubeConfig;
    private repository;
    private youtubeUrl;
    startDate: string;
    defaultStartDateDays: number;
    private params;
    constructor(repository: Repository, youtubeConfig: youtubeConfig);
    setStartDate: (startDate: Date) => Promise<void>;
    getStartDate: (youtubeChannelId: string) => Promise<void>;
    refreshTokenById: (idType: string, id: string) => Promise<PlatformToken | null>;
    importVideos: (youtubeChannelId: string, accessToken?: string | null, refreshToken?: string | null) => Promise<[formatedYoutubeVideo[], number]>;
    getVideos: (youtubeChannelId: string, accessToken?: string | null, refreshToken?: string | null) => Promise<rawYoutubeVideo[]>;
    formatVideos: (rawVideos: rawYoutubeVideo[]) => formatedYoutubeVideo[];
}