import Extension from "./index";
import { IElasticPostExt } from "../interfaces";
export default class extends Extension {
    feed: (settings: {
        page: number;
        userId?: string | undefined;
        bookmarkedOnly?: boolean | undefined;
        data?: Record<string, string | number | (string | number)[]> | undefined;
    }) => Promise<IElasticPostExt[]>;
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
    }) => Promise<{
        id: string;
        is_upvoted: boolean;
    }>;
}
