import { EntityApi } from '../static/EntityApi';
import { IBookmarkGet, IBookmarkList } from '../interfaces';
declare class BookmarkApi extends EntityApi<IBookmarkGet, IBookmarkList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: import("../extensions").Extension;
}
declare const _default: BookmarkApi;
export default _default;
export type { IBookmarkGet, IBookmarkList };
