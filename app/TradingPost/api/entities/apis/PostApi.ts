import { EntityApi } from '../static/EntityApi'
import { IPostGet,IPostList } from '../interfaces'
class PostApi extends EntityApi<IPostGet,IPostList,any,any> {
    protected getFunction = "public.api_post_get";
    protected listFunction = "public.api_post_list";
    protected insertFunction = "public.api_post_insert";
    protected updateFunction = "public.api_post_update";
    /*extensions*/
}
export default new PostApi();
export type {IPostGet,IPostList}
