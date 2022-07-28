import { rawYoutubeVideo, formatedYoutubeVideo } from '../interfaces/youtube';
import { youtubeConfig } from '../interfaces/utils';
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
    importVideos: (youtubeChannelId: string) => Promise<[formatedYoutubeVideo[], number]>;
    getVideos: (youtubeChannelId: string) => Promise<rawYoutubeVideo[]>;
    formatVideos: (rawVideos: rawYoutubeVideo[]) => formatedYoutubeVideo[];
}
