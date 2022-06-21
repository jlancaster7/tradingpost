import { EntityApi } from '../static/EntityApi';
import { ICommentGet, ICommentList } from '../interfaces';
declare class CommentApi extends EntityApi<ICommentGet, ICommentList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: CommentApi;
export default _default;
export type { ICommentGet, ICommentList };
