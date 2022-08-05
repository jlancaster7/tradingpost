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
    
    const repository = new Repository(pgClient, pgp);
    const twitterIds = await repository.getTwitterUsers();
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
    console.log(`Successfully imported ${result.length} of ${length} Twitter profiles.`);
    return result
}
export const addTwitterUsersByToken = async (twitterUsers: {userId: string, accessToken: string, refreshToken: string, expiration: number}, pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration): Promise<formatedTwitterUser | null> => {
    
    const repository = new Repository(pgClient, pgp);
    const TwitterUser = new TwitterUsers(twitterConfiguration, repository);
    const Tweet = new Tweets(twitterConfiguration, repository);
    try {
        const result = await TwitterUser.importUserByToken(twitterUsers);
        const tweetResults = await Tweet.importTweets(result[0].twitter_user_id, twitterUsers.accessToken)
        console.log(`Successfully imported ${result[0].username} Twitter profile.`);
        return result[0];
    } catch (err) {
        console.error(err);
        return null;
    }
    
}
export const addTweets = async (twitterUserId: string, pgClient: IDatabase<any>, pgp: IMain, twitterConfiguration: TwitterConfiguration, startDate?: Date): Promise<[formatedTweet[], number]> => {
    const repository = new Repository(pgClient, pgp);
    const Tweet = new Tweets(twitterConfiguration, repository);
    const token = await repository.getTokens('platform_user_id', [twitterUserId], 'twitter');
    if (startDate !== undefined) {
        await Tweet.setStartDate(twitterUserId, startDate);
    }
    const result = await Tweet.importTweets(twitterUserId, (token.length ? null : token[0].accessToken));
    console.log(`${result[1]} tweets were imported!`)
    return result;
}

