import { EntityApi } from './EntityApi'
import { IPostGet,IPostList } from '../interfaces'
class PostApi extends EntityApi<IPostGet,IPostList,any,any> {
    getFunction = "public.api_post_get";
    listFunction = "public.api_post_list";
    insertFunction = "public.api_post_insert";
    updateFunction = "public.api_post_update";
    /*extensions*/
}
export default new PostApi();
export type {IPostGet,IPostList}
