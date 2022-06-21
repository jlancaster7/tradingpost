import { EntityApi } from '../static/EntityApi'
import { IUpvoteGet,IUpvoteList } from '../interfaces'
class UpvoteApi extends EntityApi<IUpvoteGet,IUpvoteList,any,any> {
    protected getFunction = "public.api_upvote_get";
    protected listFunction = "public.api_upvote_list";
    protected insertFunction = "public.api_upvote_insert";
    protected updateFunction = "public.api_upvote_update";
    /*extensions*/
}
export default new UpvoteApi();
export type {IUpvoteGet,IUpvoteList}
