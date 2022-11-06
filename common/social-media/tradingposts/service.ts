import {IDatabase, IMain} from "pg-promise";
import Repository from '../repository';
import ElasticService from "../../elastic";
import { TradingPostsAndUsers, TradingPostsAndUsersTable } from "./interfaces";
import { SearchBody } from "../../models/elastic/search";
import PostPrepper from "../../post-prepper";

export default class TradingPostsService {
    private elasticSrv: ElasticService;
    private repository: Repository;

    constructor(repository: Repository, elasticSrv: ElasticService) {
        this.repository = repository;
        this.elasticSrv = elasticSrv;
    }
    exportTradingPostsAndUsers = async (lastTradingPostId: number): Promise<TradingPostsAndUsersTable[]> => {
        return await this.repository.getTradingPostsAndUsers(lastTradingPostId);
    }
    static map = (items: TradingPostsAndUsersTable[]): SearchBody[] => {
        return items.map((n: TradingPostsAndUsersTable) => {
            let obj: SearchBody = {
                id: `tradingpost_${n.id}`,
                content: {
                    body: n.body,
                    description: null,
                    htmlBody: null,
                    htmlTitle: null,
                    title: n.title
                },
                imageUrl: null,
                meta: {},
                platform: {
                    displayName: n.tradingpost_user_handle,
                    imageUrl: null,
                    profileUrl: null,
                    username: null
                },
                platformCreatedAt: n.created_at.toISO(),
                platformUpdatedAt: n.updated_at.toISO(),
                postType: "tradingpost",
                subscription_level: n.subscription_level,
                postTypeValue: 3,
                postUrl: null,
                ratingsCount: 0,
                tradingpostCreatedAt: n.created_at.toISO(),
                tradingpostUpdatedAt: n.updated_at.toISO(),
                size: {
                    maxWidth: n.max_width,
                    aspectRatio: n.aspect_ratio,
                },
                user: {
                    id: n.user_id,
                    imageUrl:  n.tradingpost_user_profile_url,
                    name: "",
                    type: "",
                    username: n.tradingpost_user_handle
                }
            };
            console.log(obj.size)
            return obj;
        })
    }
}
export const DefaultTradingPost = (pgClient: IDatabase<any>, pgp: IMain, elastic: ElasticService): TradingPostsService => {
    const repo = new Repository(pgClient, pgp)
    return new TradingPostsService(repo, elastic);
}
