import { IElasticPostExt } from "../interfaces";
export declare const createQueryByType: (type: string, data: any) => Promise<any>;
declare const _default: {
    feed: (req: {
        body: {
            page: number;
            postId?: string | undefined;
            userId?: string | undefined;
            bookmarkedOnly?: boolean | undefined;
            data?: Record<string, string | number | (string | number)[]> | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<IElasticPostExt[]>;
    getUpvotes: (req: {
        body: {
            id: string;
            count: number;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        id: string;
        count: number;
    }>;
    setBookmarked: (req: {
        body: {
            id: string;
            is_bookmarked: boolean;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        id: string;
        is_bookmarked: boolean;
    }>;
    setUpvoted: (req: {
        body: {
            id: string;
            is_upvoted: boolean;
            count: number;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        id: string;
        is_upvoted: boolean;
        count: number;
    }>;
    create: (req: {
        body: {
            title: string;
            content: string;
            subscription_level: string;
            width: number;
            height: number;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
    report: (req: {
        body: {
            postId: string;
            reason: string;
            details: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
