//import fs from 'fs';
//import {parse} from 'fast-csv';
import { Pool, Client, PoolClient } from 'pg';
import { getPgClient, getAWSConfigs } from '../utils/utils';
import { formatedTweet, formatedTwitterUser } from '../interfaces/twitter';
import { TwitterUsers } from './users';
import { Tweets } from './tweets';

const awsConfigs = getAWSConfigs();
/*
let stream = fs.createReadStream('twitterHandles.csv');
let csvData: string[] = [];
let csvStream = parse()
    .on("data", data => {
        csvData.push(data[0]);
    })
    .on("end", () => {
        importTwitterUsers(csvData);
    });
stream.pipe(csvStream);
*/
lambdaImportTweets();

async function lambdaImportTweets () {

    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    let query = `SELECT twitter_user_id FROM twitter_users`;

    const twitterIds = (await pg_client.query(query)).rows;
    console.log(twitterIds.length);
    const Tweet = new Tweets((await awsConfigs).twitter, pg_client);

    let result: [formatedTweet[], number];
    let tweetsImported = 0;

    for (let i = 0; i < twitterIds.length; i++) {

        result = await Tweet.importTweets(twitterIds[i].twitter_user_id);

        tweetsImported += result[1];
    }
    console.log(`${tweetsImported} tweets were imported!`);
    pg_client.end();
    return;
}


async function importTwitterUsers(handles: string | string[]): Promise<[formatedTwitterUser[], number]> {

    const pg_client: Client = await getPgClient((await awsConfigs).postgres);
    const TwitterUser = new TwitterUsers((await awsConfigs).twitter, pg_client);

    const result = await TwitterUser.importUser(handles);
    let length: number;
    if (typeof handles === 'string') {length = 1} else { length = handles.length}
    console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
    pg_client.end();
    return result;


}

async function importTweets(twitterUserId: string, startDate?: Date): Promise<[formatedTweet[], number]> {

    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    const Tweet = new Tweets((await awsConfigs).twitter, pg_client);
    if (startDate !== undefined) {Tweet.setStartDate(startDate);}
    const result = await Tweet.importTweets(twitterUserId);
    console.log(`${result[1]} tweets were imported!`)
    pg_client.end();
    return result;
}

export { lambdaImportTweets, importTwitterUsers, importTweets };