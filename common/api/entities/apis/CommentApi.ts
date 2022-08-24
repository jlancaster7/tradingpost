import { EntityApi } from '../static/EntityApi'
import { ICommentGet,ICommentList } from '../interfaces'
import { Comment as Extensions } from './extensions'
class CommentApi extends EntityApi<ICommentGet,ICommentList,never,never> {
    protected getFunction = "public.api_comment_get";
    protected listFunction = "public.api_comment_list";
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'CommentApi';
    extensions = new Extensions.default(this)
}
export default new CommentApi();
export type {ICommentGet,ICommentList}
