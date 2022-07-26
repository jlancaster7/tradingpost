import {formatedTweet, formatedTwitterUser} from '../interfaces/twitter';
import {TwitterUsers} from './users';
import {Tweets} from './tweets';
import Repository from '../repository'
import {IDatabase, IMain} from "pg-promise";

type TwitterConfiguration = {
    API_key: string
    API_secret_key: string
    bearer_token: string
}



export const lambdaImportTweets = async (pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration) => {
    
    let query = `SELECT twitter_user_id, a.access_token, a.refresh_token
                 FROM twitter_users
                 LEFT JOIN (SELECT platform_user_id, access_token, refresh_token FROM data_platform_claim WHERE platform = 'twitter') as a
                 ON twitter_users.twitter_user_id = a.platform_user_id
                 `;
    
    const twitterIds = await pgClient.query(query);
    
    const repository = new Repository(pgClient, pgp);
    const Tweet = new Tweets(twitterConfiguration, repository);
    let result: [formatedTweet[], number];
    let tweetsImported = 0;

    for (let i = 0; i < twitterIds.length; i++) {

        result = await Tweet.importTweets(twitterIds[i].twitter_user_id, twitterIds[i].access_token);
        tweetsImported += result[1];
    }

    console.log(`${tweetsImported} tweets were imported!`);
}

export const addTwitterUsersByHandle = async (handles: string | string[], pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration): Promise<formatedTwitterUser[]> => {
    
    const repository = new Repository(pgClient, pgp);
    const TwitterUser = new TwitterUsers(twitterConfiguration, repository);

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
export const addTwitterUsersByToken = async (twitterUsers: {userId: string, accessToken: string, refreshToken: string, expiration: string}[], pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration): Promise<formatedTwitterUser[]> => {
    
    const repository = new Repository(pgClient, pgp);
    const TwitterUser = new TwitterUsers(twitterConfiguration, repository);

    const result = await TwitterUser.importUserByToken(twitterUsers);


    console.log(`Successfully imported ${result[1]} of ${twitterUsers.length} Twitter profiles.`);
    return result[0];
}
export const addTweets = async (twitterUserId: string, pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration, startDate?: Date): Promise<[formatedTweet[], number]> => {
    const repository = new Repository(pgClient, pgp);
    const Tweet = new Tweets(twitterConfiguration, repository);
    if (startDate !== undefined) {
        await Tweet.setStartDate(twitterUserId, startDate);
    }
    const result = await Tweet.importTweets(twitterUserId);
    console.log(`${result[1]} tweets were imported!`)
    return result;
}

