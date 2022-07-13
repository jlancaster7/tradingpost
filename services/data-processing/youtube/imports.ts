import {formatedYoutubeVideo, formatedChannelInfo} from '../interfaces/youtube';
import {YoutubeUsers} from './users';
import {YoutubeVideos} from './videos';
import {IDatabaseClient} from "../interfaces";

type YoutubeConfiguration = {
    api_key: string
}

async function lambdaImportYoutube(pgClient: IDatabaseClient, youtubeConfiguration: YoutubeConfiguration) {
    let query = 'SELECT youtube_channel_id FROM youtube_users';

    const channelIds = (await pgClient.query(query)).rows;

    const Videos = new YoutubeVideos(youtubeConfiguration, pgClient);

    let result: [formatedYoutubeVideo[], number];
    let videosImported = 0;

    for (let i = 0; i < channelIds.length; i++) {

        result = await Videos.importVideos(channelIds[i].youtube_channel_id);
        videosImported += result[1];
    }
    console.log(`${videosImported} youtube videos were imported`);
}

async function importYoutubeUsers(pgClient: IDatabaseClient, youtubeConfiguration: YoutubeConfiguration, userChannelUrl: string | string[]): Promise<[formatedChannelInfo[], number]> {
    const Users = new YoutubeUsers(youtubeConfiguration, pgClient);

    const result = await Users.importYoutubeUsers(userChannelUrl);
    let length: number;
    if (typeof userChannelUrl === 'string') {
        length = 1
    } else {
        length = userChannelUrl.length
    }
    console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
    return result;
}

async function importVideos(pgClient: IDatabaseClient, youtubeConfiguration: YoutubeConfiguration, youtubeChannelId: string, startDate?: Date): Promise<[formatedYoutubeVideo[], number]> {
    const Vidoes = new YoutubeVideos(youtubeConfiguration, pgClient);

    if (startDate !== undefined) {
        await Vidoes.setStartDate(startDate);
    }
    const result = await Vidoes.importVideos(youtubeChannelId);
    console.log(`${result[1]} Youtube videos were imported!`);
    return result;
}

export {lambdaImportYoutube, importYoutubeUsers, importVideos};