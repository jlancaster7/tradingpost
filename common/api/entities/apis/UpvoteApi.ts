import { EntityApi } from './EntityApi'
import { IUpvoteGet,IUpvoteList } from '../interfaces'
class UpvoteApi extends EntityApi<IUpvoteGet,IUpvoteList,any,any> {
    getFunction = "public.api_upvote_get";
    listFunction = "public.api_upvote_list";
    insertFunction = "public.api_upvote_insert";
    updateFunction = "public.api_upvote_update";
    /*extensions*/
}
export default new UpvoteApi();
export type {IUpvoteGet,IUpvoteList}
