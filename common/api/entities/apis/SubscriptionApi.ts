import { EntityApi } from '../static/EntityApi'
import { ISubscriptionGet,ISubscriptionList } from '../interfaces'
import { Subscription as Extensions } from './extensions'
class SubscriptionApi extends EntityApi<ISubscriptionGet,ISubscriptionList,never,never> {
    protected getFunction = "public.api_subscription_get";
    protected listFunction = "public.api_subscription_list";
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'SubscriptionApi';
    extensions = new Extensions.default(this)
}
export default new SubscriptionApi();
export type {ISubscriptionGet,ISubscriptionList}
