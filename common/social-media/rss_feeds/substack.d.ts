import { SubstackUser, SubstackFeed, SubstackArticles } from '../interfaces/rss_feeds';
import Repository from '../repository';
export declare class Substack {
    private repository;
    constructor(repository: Repository);
    importUsers: (substackUser: {
        userId: string;
        username: string;
    }) => Promise<[SubstackUser, number]>;
    importArticles: (username: string) => Promise<[SubstackArticles[], number]>;
    getUserFeed: (username: string) => Promise<SubstackFeed | undefined>;
    formatUser: (userFeed: SubstackFeed) => SubstackUser;
    formatArticles: (userFeed: SubstackFeed) => SubstackArticles[];
}
