import { channelInfo, formatedChannelInfo } from '../interfaces/youtube';
import { youtubeConfig } from '../interfaces/utils';
import Repository from '../repository';
export declare class YoutubeUsers {
    private youtubeConfig;
    private repository;
    private youtubeUrl;
    private standardYtUrl;
    private customYtUrl;
    private params;
    constructor(repository: Repository, youtubeConfig: youtubeConfig);
    importYoutubeUsersById: (userChannelUrl: string[]) => Promise<[formatedChannelInfo[], number]>;
    importYoutubeUsersbyToken: (youtubeUsers: {
        userId: string;
        accessToken: string;
        refreshToken: string;
        expiration: Date;
    }[]) => Promise<[formatedChannelInfo[], number]>;
    getChannelInfobyToken: (token: string) => Promise<channelInfo[]>;
    getChannelInfobyUrl: (userChannelUrl: string) => Promise<channelInfo | undefined>;
    formatChannelInfo: (data: channelInfo[]) => formatedChannelInfo[];
}
