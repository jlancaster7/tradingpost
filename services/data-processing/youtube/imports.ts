import { Pool, Client, PoolClient } from 'pg';
import { getPgClient, getAWSConfigs } from '../utils/utils';
import { formatedYoutubeVideo, formatedChannelInfo } from '../interfaces/youtube';
import { YoutubeUsers } from './users';
import { YoutubeVideos } from './videos';

const awsConfigs = getAWSConfigs();

lambdaImportYoutube();


async function lambdaImportYoutube() {
    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    let query = 'SELECT youtube_channel_id FROM youtube_users';

    const channelIds = (await pg_client.query(query)).rows;

    const Videos = new YoutubeVideos((await awsConfigs).youtube, pg_client);

    let result: [formatedYoutubeVideo[], number];
    let videosImported = 0;

    for (let i = 0; i < channelIds.length; i++) {

        result = await Videos.importVideos(channelIds[i].youtube_channel_id);
        videosImported += result[1];
    }
    console.log(`${videosImported} youtube videos were imported`);
    pg_client.end();
    return;
}

async function importYoutubeUsers(userChannelUrl: string | string[]): Promise<[formatedChannelInfo[], number]> {

    const pg_client: Client = await getPgClient((await awsConfigs).postgres);
    const Users = new YoutubeUsers((await awsConfigs).youtube, pg_client);

    const result = await Users.importYoutubeUsers(userChannelUrl);
    let length: number;
    if (typeof userChannelUrl === 'string') { length = 1}  else { length = userChannelUrl.length }
    console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
    pg_client.end();
    return result;
}

async function importVideos(youtubeChannelId: string, startDate?: Date ): Promise<[formatedYoutubeVideo[], number]> {
    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    const Vidoes = new YoutubeVideos((await awsConfigs).youtube, pg_client);

    if (startDate !== undefined) { Vidoes.setStartDate(startDate);}
    const result = await Vidoes.importVideos(youtubeChannelId);
    console.log(`${result[1]} Youtube videos were imported!`);
    pg_client.end();
    return result;
}

export { lambdaImportYoutube, importYoutubeUsers, importVideos };