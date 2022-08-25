import { EntityApi } from '../static/EntityApi'
import { IPostGet,IPostList } from '../interfaces'
import { Post as Extensions } from './extensions'
class PostApi extends EntityApi<IPostGet,IPostList,never,never> {
    protected getFunction = "public.api_post_get";
    protected listFunction = "public.api_post_list";
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'PostApi';
    extensions = new Extensions.default(this)
}
export default new PostApi();
export type {IPostGet,IPostList}
