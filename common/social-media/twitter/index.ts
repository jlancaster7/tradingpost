import {formatedTweet, formatedTwitterUser} from '../interfaces/twitter';
import {TwitterUsers} from './users';
import {Tweets} from './tweets';
import {IDatabase} from "pg-promise";

type TwitterConfiguration = {
    API_key: string
    API_secret_key: string
    bearer_token: string
}

export const lambdaImportTweets = async (pgClient: IDatabase<any>, twitterConfiguration: TwitterConfiguration) => {
    console.log("Helloer!")
    let query = `SELECT twitter_user_id
                  FROM twitter_users`;

    const twitterIds = await pgClient.query(query);
    console.log("Twitter IDs... ", twitterIds)
    const Tweet = new Tweets(twitterConfiguration, pgClient);
    console.log("Created new twitter instance")
    let result: [formatedTweet[], number];
    let tweetsImported = 0;

    console.log("importing Tweets")
    for (let i = 0; i < twitterIds.length; i++) {
        result = await Tweet.importTweets(twitterIds[i].twitter_user_id);
        tweetsImported += result[1];
    }

    console.log("imported Tweets")
    console.log(`${tweetsImported} tweets were imported!`);
}

export const addTwitterUsers = async (handles: string | string[], pgClient: IDatabase<any>, twitterConfiguration: TwitterConfiguration): Promise<[formatedTwitterUser[], number]> => {
    console.log("This is wild...")
    const TwitterUser = new TwitterUsers(twitterConfiguration, pgClient);
    //
    // const result = await TwitterUser.importUser(handles);
    // let length: number;
    // if (typeof handles === 'string') {
    //     length = 1
    // } else {
    //     length = handles.length
    // }
    // console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
    // return result
    return [[],1];
}

export const addTweets = async (twitterUserId: string, pgClient: IDatabase<any>, twitterConfiguration: TwitterConfiguration, startDate?: Date): Promise<[formatedTweet[], number]> => {
    const Tweet = new Tweets(twitterConfiguration, pgClient);
    if (startDate !== undefined) {
        await Tweet.setStartDate(startDate);
    }
    const result = await Tweet.importTweets(twitterUserId);
    console.log(`${result[1]} tweets were imported!`)
    return result;
}