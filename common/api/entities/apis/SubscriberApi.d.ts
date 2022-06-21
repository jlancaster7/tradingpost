import { EntityApi } from '../static/EntityApi';
import { ISubscriberGet, ISubscriberList } from '../interfaces';
declare class SubscriberApi extends EntityApi<ISubscriberGet, ISubscriberList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: SubscriberApi;
export default _default;
export type { ISubscriberGet, ISubscriberList };
