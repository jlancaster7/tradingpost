import { EntityApi } from '../static/EntityApi';
import { IPostGet, IPostList } from '../interfaces';
declare class PostApi extends EntityApi<IPostGet, IPostList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: PostApi;
export default _default;
export type { IPostGet, IPostList };
