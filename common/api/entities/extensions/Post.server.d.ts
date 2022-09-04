import { IElasticPostExt } from "../interfaces";
declare const _default: {
    feed: (req: {
        body: {
            page: number;
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
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        id: string;
        is_upvoted: boolean;
    }>;
    create: (req: {
        body: {
            title: string;
            content: string;
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
