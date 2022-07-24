import { SubstackUser, SubstackFeed, SubstackArticles } from '../interfaces/rss_feeds';
import { IDatabase, IMain } from "pg-promise";
export declare class Substack {
    private pg_client;
    private pgp;
    constructor(pg_client: IDatabase<any>, pgp: IMain);
    importUsers: (username: string | string[]) => Promise<[SubstackUser[], number]>;
    importArticles: (username: string) => Promise<[SubstackArticles[], number]>;
    getUserFeed: (username: string) => Promise<SubstackFeed | undefined>;
    formatUser: (userFeed: SubstackFeed) => SubstackUser;
    formatArticles: (userFeed: SubstackFeed) => SubstackArticles[];
    appendUser: (data: SubstackUser) => Promise<number>;
    appendArticles: (formattedArticles: SubstackArticles[]) => Promise<number>;
}
