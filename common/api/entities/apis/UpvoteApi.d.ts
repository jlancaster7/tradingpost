import { EntityApi } from '../static/EntityApi';
import { IUpvoteGet, IUpvoteList } from '../interfaces';
declare class UpvoteApi extends EntityApi<IUpvoteGet, IUpvoteList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: UpvoteApi;
export default _default;
export type { IUpvoteGet, IUpvoteList };
