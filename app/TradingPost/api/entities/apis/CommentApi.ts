import { EntityApi } from '../static/EntityApi'
import { ICommentGet,ICommentList } from '../interfaces'
class CommentApi extends EntityApi<ICommentGet,ICommentList,any,any> {
    protected getFunction = "public.api_comment_get";
    protected listFunction = "public.api_comment_list";
    protected insertFunction = "public.api_comment_insert";
    protected updateFunction = "public.api_comment_update";
    /*extensions*/
}
export default new CommentApi();
export type {ICommentGet,ICommentList}
