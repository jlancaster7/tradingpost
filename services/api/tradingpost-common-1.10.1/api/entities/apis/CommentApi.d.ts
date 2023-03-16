import { EntityApi } from '../static/EntityApi';
import { ICommentGet, ICommentList, ICommentInsert } from '../interfaces';
import { Comment as Extensions } from './extensions';
declare class CommentApi extends EntityApi<ICommentGet, ICommentList, ICommentInsert, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: CommentApi;
export default _default;
export type { ICommentGet, ICommentList, ICommentInsert };
