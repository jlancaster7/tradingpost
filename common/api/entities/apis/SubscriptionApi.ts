import { EntityApi } from '../static/EntityApi'
import { ISubscriptionGet,ISubscriptionList,ISubscriptionInsert,ISubscriptionUpdate } from '../interfaces'
import { Subscription as Extensions } from './extensions'
class SubscriptionApi extends EntityApi<ISubscriptionGet,ISubscriptionList,ISubscriptionInsert,ISubscriptionUpdate> {
    protected getFunction = "public.api_subscription_get";
    protected listFunction = "public.api_subscription_list";
    protected insertFunction = "public.api_subscription_insert";
    protected updateFunction = "public.api_subscription_update";
    protected apiCallName = 'SubscriptionApi';
    extensions = new Extensions.default(this)
}
export default new SubscriptionApi();
export type {ISubscriptionGet,ISubscriptionList,ISubscriptionInsert,ISubscriptionUpdate}
