import { SubstackAndNewsletter, SubstackAndNewsletterTable } from './interfaces';
import SubStack from './';
import Repository from '../repository';
import { IDatabase, IMain } from "pg-promise";
import PostPrepper from "../../post-prepper";
import ElasticService from "../../elastic";
import { SearchBody } from "../../models/elastic/search";
declare class SubstackService {
    private postPrepper;
    private elasticSrv;
    private repository;
    private client;
    constructor(client: SubStack, elasticSrv: ElasticService, repository: Repository, postPrepper: PostPrepper);
    importArticles: () => Promise<void>;
    exportArticlesAndUsers: (lastId: number) => Promise<SubstackAndNewsletterTable[]>;
    importUsers: (substackUsers: {
        userId: string;
        username: string;
    }) => Promise<void>;
    map: (items: SubstackAndNewsletter[]) => SearchBody[];
}
export declare const DefaultSubstack: (pgClient: IDatabase<any>, pgp: IMain, postPrepper: PostPrepper, elastic: ElasticService) => SubstackService;
export {};
