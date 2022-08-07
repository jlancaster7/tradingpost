import { EntityApi } from '../static/EntityApi';
import { IWatchlistGet, IWatchlistList, IWatchlistInsert, IWatchlistUpdate } from '../interfaces';
import { Watchlist as Extensions } from './extensions';
declare class WatchlistApi extends EntityApi<IWatchlistGet, IWatchlistList, IWatchlistInsert, IWatchlistUpdate> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    extensions: Extensions.default;
}
declare const _default: WatchlistApi;
export default _default;
export type { IWatchlistGet, IWatchlistList, IWatchlistInsert, IWatchlistUpdate };
