import { channelInfo, formatedChannelInfo } from '../interfaces/youtube';
import { youtubeConfig } from '../interfaces/utils';
import { IDatabase, IMain } from "pg-promise";
export declare class YoutubeUsers {
    private youtubeConfig;
    private pg_client;
    private pgp;
    private youtubeUrl;
    private standardYtUrl;
    private customYtUrl;
    private params;
    constructor(youtubeConfig: youtubeConfig, pg_client: IDatabase<any>, pgp: IMain);
    importYoutubeUsers: (userChannelUrl: string | string[]) => Promise<[formatedChannelInfo[], number]>;
    getChannelInfobyUrl: (userChannelUrl: string) => Promise<channelInfo | undefined>;
    formatChannelInfo: (data: channelInfo) => formatedChannelInfo;
    appendChannelInfo: (data: formatedChannelInfo) => Promise<number>;
}
