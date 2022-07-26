import { EntityApi } from '../static/EntityApi';
import { ICommentGet, ICommentList } from '../interfaces';
declare class CommentApi extends EntityApi<ICommentGet, ICommentList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    extensions: import("../extensions").Extension;
}
declare const _default: CommentApi;
export default _default;
export type { ICommentGet, ICommentList };
