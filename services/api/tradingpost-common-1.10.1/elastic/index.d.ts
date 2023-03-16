import { Client } from '@elastic/elasticsearch';
import PostApi from '../api/entities/apis/PostApi';
import { SearchBody } from '../models/elastic/search';
export declare const searchQuery: (data: Exclude<Parameters<(typeof PostApi)["extensions"]["feed"]>["0"]["data"], undefined>) => Promise<any>;
export default class ElasticService {
    private client;
    private readonly indexName;
    constructor(client: Client, indexName?: string);
    search: (searchTerm: string) => Promise<import("@elastic/elasticsearch/lib/api/types").SearchHitsMetadata<{
        id: string;
        content: {
            body: string;
            description: string;
            htmlBody: string;
            htmlTitle: string | null;
            title: string | null;
        };
        imageUrl: null;
        meta: {};
        platform: {
            displayName: string;
            imageUrl: string;
            profileUrl: string;
            username: string;
        };
        platformCreatedAt: string;
        platformUpdatedAt: null;
        postType: "spotify" | "youtube" | "substack" | "tweet" | "tradingpost";
        subscription_level: "standard" | "premium";
        postTypeValue: number;
        postUrl: string;
        ratingsCount: 0;
        tradingpostCreatedAt: string;
        tradingpostUpdatedAt: null;
        size: {
            maxWidth: number;
            aspectRatio: number;
        };
        user: {
            id: string;
        };
    }>>;
    ingest: (items: SearchBody[], indexName?: string | null, length?: number) => Promise<void>;
}
