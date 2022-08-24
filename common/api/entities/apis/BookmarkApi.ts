import { EntityApi } from '../static/EntityApi'
import { IBookmarkGet,IBookmarkList } from '../interfaces'
import { Bookmark as Extensions } from './extensions'
class BookmarkApi extends EntityApi<IBookmarkGet,IBookmarkList,never,never> {
    protected getFunction = "public.api_bookmark_get";
    protected listFunction = "public.api_bookmark_list";
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'BookmarkApi';
    extensions = new Extensions.default(this)
}
export default new BookmarkApi();
export type {IBookmarkGet,IBookmarkList}
