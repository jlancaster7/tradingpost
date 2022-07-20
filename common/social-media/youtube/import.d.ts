import { formatedYoutubeVideo, formatedChannelInfo } from '../interfaces/youtube';
import { IDatabase, IMain } from "pg-promise";
declare type YoutubeConfiguration = {
    api_key: string;
};
declare function lambdaImportYoutube(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration): Promise<void>;
declare function importYoutubeUsers(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, userChannelUrl: string | string[]): Promise<[formatedChannelInfo[], number]>;
declare function importVideos(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, youtubeChannelId: string, startDate?: Date): Promise<[formatedYoutubeVideo[], number]>;
export { lambdaImportYoutube, importYoutubeUsers, importVideos };
