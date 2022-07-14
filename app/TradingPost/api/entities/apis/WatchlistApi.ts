import { EntityApi } from '../static/EntityApi'
import { IWatchlistGet,IWatchlistList,IWatchlistInsert,IWatchlistUpdate } from '../interfaces'
class WatchlistApi extends EntityApi<IWatchlistGet,IWatchlistList,IWatchlistInsert,IWatchlistUpdate> {
    protected getFunction = "public.api_watchlist_get";
    protected listFunction = "public.api_watchlist_list";
    protected insertFunction = "public.api_watchlist_insert";
    protected updateFunction = "public.api_watchlist_update";
    /*extensions*/
}
export default new WatchlistApi();
export type {IWatchlistGet,IWatchlistList,IWatchlistInsert,IWatchlistUpdate}
