import {SubstackUser, SubstackArticles} from '../interfaces/rss_feeds';
import {Substack} from './substack';
import Repository from '../repository';
import {IDatabase, IMain} from "pg-promise";
import PostPrepper from "../../post-prepper/index";


async function lambdaImportRSSFeeds(pgClient: IDatabase<any>, pgp: IMain, postPrepper: PostPrepper) {
    const repository = new Repository(pgClient, pgp);
    const substackIds = await repository.getSubstackUsers();
    const ssArticles = new Substack(repository, postPrepper);

    let result: [SubstackArticles[], number];
    let articlesImported = 0;

    for (let i = 0; i < substackIds.length; i++) {
        result = await ssArticles.importArticles(substackIds[i].substack_user_id);
        articlesImported += result[1];
    }

    console.log(`Imported ${articlesImported} substack articles.`);
}

async function importSubstackUsers(substackUsers: { userId: string, username: string }, pgClient: IDatabase<any>, pgp: IMain, postPrepper: PostPrepper) {
    const repository = new Repository(pgClient, pgp);
    const ssUsers = new Substack(repository, postPrepper);

    const result = await ssUsers.importUsers(substackUsers);

    console.log(`Successfully imported ${substackUsers.username}Substack user for userId: ${substackUsers.username}.`)
}

export {lambdaImportRSSFeeds, importSubstackUsers};