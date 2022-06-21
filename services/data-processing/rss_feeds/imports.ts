import { Pool, Client, PoolClient } from 'pg';
import { getPgClient, getAWSConfigs } from '../utils/utils';
import { SubstackUser, SubstackFeed, SubstackArticles } from '../interfaces/rss_feeds';
import { Substack } from './substack';

const awsConfigs = getAWSConfigs();

async function lambdaImportRSSFeeds() {

    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    let query = `SELECT substack_user_id FROM substack_users`;
    //TODO: I could do this a lot better.. making getting the substack Ids apart of the class
    //      and adding a function to set your own list of substackIds.. similar to start date.
    //      but its fine for now
    const substackIds = (await pg_client.query(query)).rows;

    const ssArticles = new Substack(pg_client);

    let result: [SubstackArticles[], number];
    let articlesImported = 0;

    for (let i = 0; i < substackIds.length; i++) {

        result = await ssArticles.importArticles(substackIds[i].substack_user_id);

        articlesImported += result[1];
    }
    console.log(`Imported ${articlesImported} substack articles.`);
    pg_client.end();
    return ;
}

async function importSubstackUsers(username: string | string[]) {
    const pg_client: Client = await getPgClient((await awsConfigs).postgres);
    const ssUsers = new Substack(pg_client);

    const result: [SubstackUser[], number] = await ssUsers.importUsers(username);
    let length: number;
    if (typeof username === 'string') {length=1} else {length = username.length};
    console.log(`Successfully imported ${result[1]} of ${length} Substack users.`)
}

export { lambdaImportRSSFeeds, importSubstackUsers };