import {SubstackUser, SubstackArticles} from '../interfaces/rss_feeds';
import {Substack} from './substack';
import Repository from '../repository';
import {IDatabase, IMain} from "pg-promise";



async function lambdaImportRSSFeeds(pgClient: IDatabase<any>, pgp: IMain) {

    const repository = new Repository(pgClient, pgp);
    const substackIds = await repository.getSubstackUsers();
    const ssArticles = new Substack(repository);

    let result: [SubstackArticles[], number];
    let articlesImported = 0;

    for (let i = 0; i < substackIds.length; i++) {
        result = await ssArticles.importArticles(substackIds[i].substack_user_id);
        articlesImported += result[1];
    }

    console.log(`Imported ${articlesImported} substack articles.`);
}

async function importSubstackUsers(username: string | string[], pgClient: IDatabase<any>, pgp: IMain) {
    const repository = new Repository(pgClient, pgp);
    const ssUsers = new Substack(repository);

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