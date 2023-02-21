import { SubstackUser, SubstackFeed, SubstackArticles } from './interfaces';
import Repository from '../repository';
import PostPrepper from "../../post-prepper";
export default class Substack {
    private repository;
    private postPrepper;
    constructor(repository: Repository, postPrepper: PostPrepper);
    adminImportUsers: (username: string) => Promise<number>;
    importUsers: (substackUser: {
        userId: string;
        username: string;
    }) => Promise<[SubstackUser, number]>;
    importArticles: (username: string) => Promise<[SubstackArticles[], number]>;
    getUserFeed: (username: string) => Promise<SubstackFeed | undefined>;
    formatUser: (userFeed: SubstackFeed) => SubstackUser;
    formatArticles: (userFeed: SubstackFeed) => Promise<SubstackArticles[]>;
}
