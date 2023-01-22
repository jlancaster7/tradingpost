import { EntityApi } from '../static/EntityApi';
import { IWatchlistItemGet, IWatchlistItemList, IWatchlistItemInsert } from '../interfaces';
declare class WatchlistItemApi extends EntityApi<IWatchlistItemGet, IWatchlistItemList, IWatchlistItemInsert, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: import("../extensions").Extension;
}
declare const _default: WatchlistItemApi;
export default _default;
export type { IWatchlistItemGet, IWatchlistItemList, IWatchlistItemInsert };
