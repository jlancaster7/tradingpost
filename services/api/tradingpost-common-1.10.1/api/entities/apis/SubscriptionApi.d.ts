import { EntityApi } from '../static/EntityApi';
import { ISubscriptionGet, ISubscriptionList, ISubscriptionInsert, ISubscriptionUpdate } from '../interfaces';
import { Subscription as Extensions } from './extensions';
declare class SubscriptionApi extends EntityApi<ISubscriptionGet, ISubscriptionList, ISubscriptionInsert, ISubscriptionUpdate> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: SubscriptionApi;
export default _default;
export type { ISubscriptionGet, ISubscriptionList, ISubscriptionInsert, ISubscriptionUpdate };
