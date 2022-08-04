import { IElasticPostExt } from "../interfaces";
declare const _default: {
    feed: (req: {
        body: {
            page: number;
            bookmarkedOnly?: boolean | undefined;
            data?: Record<string, string | number | (string | number)[]> | undefined;
        };
        extra: {
            userId: string;
        };
    }) => Promise<IElasticPostExt[]>;
    setBookmarked: (req: {
        body: {
            id: string;
            is_bookmarked: boolean;
        };
        extra: {
            userId: string;
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
        };
    }) => Promise<{
        id: string;
        is_upvoted: boolean;
    }>;
};
export default _default;
