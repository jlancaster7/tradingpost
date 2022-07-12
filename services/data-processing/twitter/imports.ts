import {Client} from 'pg';
import {formatedTweet, formatedTwitterUser} from '../interfaces/twitter';
import {TwitterUsers} from './users';
import {Tweets} from './tweets';

type TwitterConfiguration = {
    API_key: string
    API_secret_key: string
    bearer_token: string
}

async function lambdaImportTweets(pgClient: Client, twitterConfiguration: TwitterConfiguration) {
    let query = `SELECT twitter_user_id
                 FROM twitter_users`;

    const twitterIds = (await pgClient.query(query)).rows;

    const Tweet = new Tweets(twitterConfiguration, pgClient);

    let result: [formatedTweet[], number];
    let tweetsImported = 0;

    for (let i = 0; i < twitterIds.length; i++) {

        result = await Tweet.importTweets(twitterIds[i].twitter_user_id);

        tweetsImported += result[1];
    }
    console.log(`${tweetsImported} tweets were imported!`);
}


async function importTwitterUsers(handles: string | string[], pgClient: Client, twitterConfiguration: TwitterConfiguration): Promise<[formatedTwitterUser[], number]> {
    const TwitterUser = new TwitterUsers(twitterConfiguration, pgClient);

    const result = await TwitterUser.importUser(handles);
    let length: number;
    if (typeof handles === 'string') {
        length = 1
    } else {
        length = handles.length
    }
    console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
    return result
}

async function importTweets(twitterUserId: string, pgClient: Client, twitterConfiguration: TwitterConfiguration, startDate?: Date): Promise<[formatedTweet[], number]> {
    const Tweet = new Tweets(twitterConfiguration, pgClient);
    if (startDate !== undefined) {
        await Tweet.setStartDate(startDate);
    }
    const result = await Tweet.importTweets(twitterUserId);
    console.log(`${result[1]} tweets were imported!`)
    return result;
}

export {lambdaImportTweets, importTwitterUsers, importTweets};