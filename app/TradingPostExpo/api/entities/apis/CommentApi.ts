import { EntityApi } from './EntityApi'
import { ICommentGet,ICommentList } from '../interfaces'
class CommentApi extends EntityApi<ICommentGet,ICommentList,any,any> {
    getFunction = "public.api_comment_get";
    listFunction = "public.api_comment_list";
    insertFunction = "public.api_comment_insert";
    updateFunction = "public.api_comment_update";
    /*extensions*/
}
export default new CommentApi();
export type {ICommentGet,ICommentList}
