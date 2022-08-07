import { EntityApi } from '../static/EntityApi';
import { IPostGet, IPostList } from '../interfaces';
import { Post as Extensions } from './extensions';
declare class PostApi extends EntityApi<IPostGet, IPostList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    extensions: Extensions.default;
}
declare const _default: PostApi;
export default _default;
export type { IPostGet, IPostList };
