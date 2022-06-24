import { EntityApi } from '../static/EntityApi';
import { IBookmarkGet, IBookmarkList } from '../interfaces';
declare class BookmarkApi extends EntityApi<IBookmarkGet, IBookmarkList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: BookmarkApi;
export default _default;
export type { IBookmarkGet, IBookmarkList };
