import { EntityApi } from '../static/EntityApi'
import { IWatchlistItemGet,IWatchlistItemList } from '../interfaces'
class WatchlistItemApi extends EntityApi<IWatchlistItemGet,IWatchlistItemList,never,never> {
    protected getFunction = "public.api_watchlist_item_get";
    protected listFunction = "public.api_watchlist_item_list";
    protected insertFunction = '';
    protected updateFunction = '';
    /*extensions*/
}
export default new WatchlistItemApi();
export type {IWatchlistItemGet,IWatchlistItemList}
