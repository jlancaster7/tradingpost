import { IUserList } from "./entities/interfaces";
import UserApi from "./entities/apis/UserApi";
import PostApi from "./entities/apis/PostApi";
import WatchlistApi from "./entities/apis/WatchlistApi";
import WatchlistSavedApi from "./entities/apis/WatchlistSavedApi";
type ExistsRecord = Record<string, true>;
export type PriceInfo = {
    id: number;
    symbol: string;
    price: {
        price: number;
        time: string;
        open: number;
        high: number;
        low: number;
    };
};
export declare const getPriceCacheTask: Promise<{
    byTicker: Record<string, PriceInfo["price"]>;
}>;
export declare const getUserCache: () => Promise<Record<string, {
    profile: IUserList;
    bookmarks: ExistsRecord;
    upvotes: ExistsRecord;
    watchlists: number[];
    blocked: string[];
}>>;
export declare const getPostCache: () => Promise<Record<string, {
    upvotes: number;
}>>;
type MotitoredType = typeof UserApi | typeof PostApi | typeof WatchlistApi | typeof WatchlistSavedApi;
export declare const cacheMonitor: <A extends MotitoredType>(api: A, action: string, currentUserId: string, responseData: any) => Promise<void>;
export {};
