import { formatedYoutubeVideo, formatedChannelInfo } from '../interfaces/youtube';
import { IDatabase, IMain } from "pg-promise";
declare type YoutubeConfiguration = {
    api_key: string;
};
declare function lambdaImportYoutube(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration): Promise<void>;
declare function importYoutubeUsersById(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, userChannelUrl: string[]): Promise<[formatedChannelInfo[], number]>;
declare function importYoutubeUsersByToken(youtubeUsers: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiration: string;
}[], pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration): Promise<[formatedChannelInfo[], number]>;
declare function importVideos(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, youtubeChannelId: string, startDate?: Date): Promise<[formatedYoutubeVideo[], number]>;
export { lambdaImportYoutube, importYoutubeUsersById, importVideos, importYoutubeUsersByToken };
