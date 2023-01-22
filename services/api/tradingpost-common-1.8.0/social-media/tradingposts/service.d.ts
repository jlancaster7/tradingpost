import { IDatabase, IMain } from "pg-promise";
import Repository from '../repository';
import ElasticService from "../../elastic";
import { TradingPostsAndUsersTable } from "./interfaces";
import { SearchBody } from "../../models/elastic/search";
export default class TradingPostsService {
    private elasticSrv;
    private repository;
    constructor(repository: Repository, elasticSrv: ElasticService);
    exportTradingPostsAndUsers: (lastTradingPostId: number) => Promise<TradingPostsAndUsersTable[]>;
    static map: (items: TradingPostsAndUsersTable[]) => SearchBody[];
}
export declare const DefaultTradingPost: (pgClient: IDatabase<any>, pgp: IMain, elastic: ElasticService) => TradingPostsService;
