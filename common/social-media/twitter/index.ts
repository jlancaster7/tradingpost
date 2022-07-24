import {formatedTweet, formatedTwitterUser} from '../interfaces/twitter';
import {TwitterUsers} from './users';
import {Tweets} from './tweets';
import {IDatabase, IMain} from "pg-promise";

type TwitterConfiguration = {
    API_key: string
    API_secret_key: string
    bearer_token: string
}



export const lambdaImportTweets = async (pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration) => {
    let query = `SELECT twitter_user_id, twitter_users.user_id, token
                 FROM twitter_users
                 LEFT JOIN (SELECT user_id, token FROM platform_tokens WHERE platform = 'twitter') as a
                 ON twitter_users.user_id = a.user_id
                 `;

    const twitterIds = await pgClient.query(query);
    const Tweet = new Tweets(twitterConfiguration, pgClient, pgp);
    let result: [formatedTweet[], number];
    let tweetsImported = 0;

    for (let i = 0; i < twitterIds.length; i++) {

        result = await Tweet.importTweets(twitterIds[i].twitter_user_id, twitterIds[i].token);
        tweetsImported += result[1];
    }

    console.log(`${tweetsImported} tweets were imported!`);
}

export const addTwitterUsersByHandle = async (handles: string | string[], pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration): Promise<[formatedTwitterUser[], number]> => {
    const TwitterUser = new TwitterUsers(twitterConfiguration, pgClient, pgp);

    const result = await TwitterUser.importUserByHandle(handles);
    let length: number;
    if (typeof handles === 'string') {
        length = 1
    } else {
        length = handles.length
    }
    console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
    return result
}
export const addTwitterUsersByToken = async (twitterUsers: {userIds: string, tokens: string}[], pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration): Promise<[formatedTwitterUser[], number]> => {
    const TwitterUser = new TwitterUsers(twitterConfiguration, pgClient, pgp);

    await TwitterUser.upsertUserToken(twitterUsers);

    const result = await TwitterUser.importUserByToken(twitterUsers);

    console.log(`Successfully imported ${result[1]} of ${twitterUsers.length} Twitter profiles.`);
    return result
}
export const addTweets = async (twitterUserId: string, pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration, startDate?: Date): Promise<[formatedTweet[], number]> => {
    const Tweet = new Tweets(twitterConfiguration, pgClient, pgp);
    if (startDate !== undefined) {
        await Tweet.setStartDate(startDate);
    }
    const result = await Tweet.importTweets(twitterUserId);
    console.log(`${result[1]} tweets were imported!`)
    return result;
}