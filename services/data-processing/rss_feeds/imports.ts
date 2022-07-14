import {SubstackUser, SubstackArticles} from '../interfaces/rss_feeds';
import {Substack} from './substack';
import {IDatabaseClient} from "../interfaces";
import {IDatabase} from "pg-promise";

type SubstackConfiguration = {}

async function lambdaImportRSSFeeds(pgClient: IDatabase<any>, substackConfiguration: SubstackConfiguration) {
    let query = `SELECT substack_user_id
                 FROM substack_users`;
    //TODO: I could do this a lot better.. making getting the substack Ids apart of the class
    //      and adding a function to set your own list of substackIds.. similar to start date.
    //      but its fine for now
    const substackIds = await pgClient.query(query);

    const ssArticles = new Substack(pgClient);

    let result: [SubstackArticles[], number];
    let articlesImported = 0;

    for (let i = 0; i < substackIds.length; i++) {
        result = await ssArticles.importArticles(substackIds[i].substack_user_id);
        articlesImported += result[1];
    }

    console.log(`Imported ${articlesImported} substack articles.`);
}

async function importSubstackUsers(username: string | string[], pgClient: IDatabase<any>, substackConfiguration: SubstackConfiguration) {
    const ssUsers = new Substack(pgClient);

    const result: [SubstackUser[], number] = await ssUsers.importUsers(username);
    let length: number;
    if (typeof username === 'string') {
        length = 1
    } else {
        length = username.length
    }

    console.log(`Successfully imported ${result[1]} of ${length} Substack users.`)
}

export {lambdaImportRSSFeeds, importSubstackUsers};