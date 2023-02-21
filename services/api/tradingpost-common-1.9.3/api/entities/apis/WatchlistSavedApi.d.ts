import { EntityApi } from '../static/EntityApi';
import { IWatchlistSavedList } from '../interfaces';
declare class WatchlistSavedApi extends EntityApi<never, IWatchlistSavedList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: import("../extensions").Extension;
}
declare const _default: WatchlistSavedApi;
export default _default;
export type { IWatchlistSavedList };
