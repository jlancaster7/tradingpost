import { EntityApi } from '../static/EntityApi'
import { IBookmarkGet,IBookmarkList } from '../interfaces'
class BookmarkApi extends EntityApi<IBookmarkGet,IBookmarkList,any,any> {
    protected getFunction = "public.api_bookmark_get";
    protected listFunction = "public.api_bookmark_list";
    protected insertFunction = "public.api_bookmark_insert";
    protected updateFunction = "public.api_bookmark_update";
    /*extensions*/
}
export default new BookmarkApi();
export type {IBookmarkGet,IBookmarkList}
