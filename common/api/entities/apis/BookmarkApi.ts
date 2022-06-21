import { EntityApi } from '../static/EntityApi'
import { IBookmarkGet,IBookmarkList } from '../interfaces'
class BookmarkApi extends EntityApi<IBookmarkGet,IBookmarkList,any,any> {
    getFunction = "public.api_bookmark_get";
    listFunction = "public.api_bookmark_list";
    insertFunction = "public.api_bookmark_insert";
    updateFunction = "public.api_bookmark_update";
    /*extensions*/
}
export default new BookmarkApi();
export type {IBookmarkGet,IBookmarkList}
