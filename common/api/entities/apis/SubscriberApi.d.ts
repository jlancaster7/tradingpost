import { EntityApi } from '../static/EntityApi';
import { ISubscriberGet, ISubscriberList } from '../interfaces';
declare class SubscriberApi extends EntityApi<ISubscriberGet, ISubscriberList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    extensions: import("../extensions").Extension;
}
declare const _default: SubscriberApi;
export default _default;
export type { ISubscriberGet, ISubscriberList };
