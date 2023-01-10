import Extension from "./index";
import { IElasticPostExt } from "../interfaces";
export default class extends Extension {
    feed: (settings: {
        page: number;
        postId?: string | undefined;
        userId?: string | undefined;
        bookmarkedOnly?: boolean | undefined;
        data?: Record<string, string | number | (string | number)[]> | undefined;
    }) => Promise<IElasticPostExt[]>;
    multitermfeed: (settings: {
        page: number;
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
        subscription_level: string;
        width: number;
        height: number;
    }) => Promise<{}>;
    report: (settings: {
        postId: string;
        reason: string;
        details: string;
    }) => Promise<{}>;
}
