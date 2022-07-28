import { formatedYoutubeVideo, formatedChannelInfo } from '../interfaces/youtube';
import { YoutubeUsers } from './users';
import { YoutubeVideos } from './videos';
import { IDatabase, IMain } from "pg-promise";
import Repository from '../repository';

type YoutubeConfiguration = {
    api_key: string
}

async function lambdaImportYoutube(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration) {

    const repository = new Repository(pgClient, pgp);
    const channelIds = await repository.getYoutubeUsers();
    const Videos = new YoutubeVideos(repository, youtubeConfiguration);

    let result: [formatedYoutubeVideo[], number];
    let videosImported = 0;

    for (let i = 0; i < channelIds.length; i++) {
        result = await Videos.importVideos(channelIds[i].youtube_channel_id);
        videosImported += result[1];
    }

    console.log(`${videosImported} youtube videos were imported`);
}

async function importYoutubeUsersById(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, userChannelUrl: string[]): Promise<[formatedChannelInfo[], number]> {
    const repository = new Repository(pgClient, pgp);
    const Users = new YoutubeUsers(repository, youtubeConfiguration);

    const result = await Users.importYoutubeUsersById(userChannelUrl);
    let length: number;
    if (typeof userChannelUrl === 'string') {
        length = 1
    } else {
        length = userChannelUrl.length
    }
    console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
    return result;
}

async function importYoutubeUsersByToken(youtubeUsers: {userId: string, accessToken: string, refreshToken: string, expiration: Date}[], pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration): Promise<[formatedChannelInfo[], number]> {
    const repository = new Repository(pgClient, pgp);
    const Users = new YoutubeUsers(repository, youtubeConfiguration);

    const result = await Users.importYoutubeUsersbyToken(youtubeUsers);

    console.log(`Successfully imported ${result[1]} of ${youtubeUsers.length} Twitter profiles.`);
    return result;
}

async function importVideos(pgClient: IDatabase<any>, pgp: IMain, youtubeConfiguration: YoutubeConfiguration, youtubeChannelId: string, startDate?: Date): Promise<[formatedYoutubeVideo[], number]> {
    const repository = new Repository(pgClient, pgp);
    const Videos = new YoutubeVideos(repository, youtubeConfiguration);

    if (startDate !== undefined) {
        await Videos.setStartDate(startDate);
    }
    const result = await Videos.importVideos(youtubeChannelId);
    console.log(`${result[1]} Youtube videos were imported!`);
    return result;
}

export { lambdaImportYoutube, importYoutubeUsersById, importVideos, importYoutubeUsersByToken};