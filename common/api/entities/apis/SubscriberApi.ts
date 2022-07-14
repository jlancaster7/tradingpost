import { EntityApi } from '../static/EntityApi'
import { ISubscriberGet,ISubscriberList } from '../interfaces'
class SubscriberApi extends EntityApi<ISubscriberGet,ISubscriberList,never,never> {
    protected getFunction = "public.api_subscriber_get";
    protected listFunction = "public.api_subscriber_list";
    protected insertFunction = '';
    protected updateFunction = '';
    /*extensions*/
}
export default new SubscriberApi();
export type {ISubscriberGet,ISubscriberList}
