import { EntityApi } from '../static/EntityApi'
import { IUpvoteGet,IUpvoteList } from '../interfaces'
class UpvoteApi extends EntityApi<IUpvoteGet,IUpvoteList,never,never> {
    protected getFunction = "public.api_upvote_get";
    protected listFunction = "public.api_upvote_list";
    protected insertFunction = '';
    protected updateFunction = '';
    /*extensions*/
}
export default new UpvoteApi();
export type {IUpvoteGet,IUpvoteList}
