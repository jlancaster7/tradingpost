import { EntityApi } from '../static/EntityApi';
import { ISubscriberGet, ISubscriberList, ISubscriberInsert, ISubscriberUpdate } from '../interfaces';
import { Subscriber as Extensions } from './extensions';
declare class SubscriberApi extends EntityApi<ISubscriberGet, ISubscriberList, ISubscriberInsert, ISubscriberUpdate> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: SubscriberApi;
export default _default;
export type { ISubscriberGet, ISubscriberList, ISubscriberInsert, ISubscriberUpdate };
