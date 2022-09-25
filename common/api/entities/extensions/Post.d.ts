import Extension from "./index";
import { IElasticPostExt } from "../interfaces";
export default class extends Extension {
    feed: (settings: {
        page: number;
        userId?: string | undefined;
        bookmarkedOnly?: boolean | undefined;
        data?: Record<string, string | number | (string | number)[]> | undefined;
    }) => Promise<IElasticPostExt[]>;
    getUpvotes: (settings: {
        id: string;
        count: number;
    }) => Promise<{
        id: string;
        count: number;
    }>;
    setBookmarked: (settings: {
        id: string;
        is_bookmarked: boolean;
    }) => Promise<{
        id: string;
        is_bookmarked: boolean;
    }>;
    setUpvoted: (settings: {
        id: string;
        is_upvoted: boolean;
        count: number;
    }) => Promise<{
        id: string;
        is_upvoted: boolean;
        count: number;
    }>;
    create: (settings: {
        title: string;
        content: string;
    }) => Promise<{}>;
}
