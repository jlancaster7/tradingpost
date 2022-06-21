import { EntityApi } from '../static/EntityApi'
import { ISubscriberGet,ISubscriberList } from '../interfaces'
class SubscriberApi extends EntityApi<ISubscriberGet,ISubscriberList,any,any> {
    protected getFunction = "public.api_subscriber_get";
    protected listFunction = "public.api_subscriber_list";
    protected insertFunction = "public.api_subscriber_insert";
    protected updateFunction = "public.api_subscriber_update";
    /*extensions*/
}
export default new SubscriberApi();
export type {ISubscriberGet,ISubscriberList}
