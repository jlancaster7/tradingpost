import { rawYoutubeVideo, formatedYoutubeVideo } from '../interfaces/youtube';
import { youtubeConfig } from '../interfaces/utils';
import { IDatabase, IMain } from "pg-promise";
export declare class YoutubeVideos {
    private youtubeConfig;
    private pg_client;
    private youtubeUrl;
    startDate: string;
    defaultStartDateDays: number;
    private params;
    private pgp;
    constructor(youtubeConfig: youtubeConfig, pg_client: IDatabase<any>, pgp: IMain);
    setStartDate: (startDate: Date) => Promise<void>;
    getStartDate: (youtubeChannelId: string) => Promise<void>;
    importVideos: (youtubeChannelId: string) => Promise<[formatedYoutubeVideo[], number]>;
    getVideos: (youtubeChannelId: string) => Promise<rawYoutubeVideo[]>;
    formatVideos: (rawVideos: rawYoutubeVideo[]) => formatedYoutubeVideo[];
    appendVideos: (formattedVideos: formatedYoutubeVideo[]) => Promise<number>;
}
