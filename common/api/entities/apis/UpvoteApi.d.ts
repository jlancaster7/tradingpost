import { EntityApi } from '../static/EntityApi';
import { IUpvoteGet, IUpvoteList } from '../interfaces';
declare class UpvoteApi extends EntityApi<IUpvoteGet, IUpvoteList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    extensions: import("../extensions").Extension;
}
declare const _default: UpvoteApi;
export default _default;
export type { IUpvoteGet, IUpvoteList };
