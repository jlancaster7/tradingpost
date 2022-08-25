import { EntityApi } from '../static/EntityApi'
import { IWatchlistSavedList } from '../interfaces'
import { WatchlistSaved as Extensions } from './extensions'
class WatchlistSavedApi extends EntityApi<never,IWatchlistSavedList,never,never> {
    protected getFunction = '';
    protected listFunction = "public.api_watchlist_saved_list";
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'WatchlistSavedApi';
    extensions = new Extensions.default(this)
}
export default new WatchlistSavedApi();
export type {IWatchlistSavedList}
