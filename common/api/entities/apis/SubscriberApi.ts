import { EntityApi } from '../static/EntityApi'
import { ISubscriberGet,ISubscriberList,ISubscriberInsert,ISubscriberUpdate } from '../interfaces'
import { Subscriber as Extensions } from './extensions'
class SubscriberApi extends EntityApi<ISubscriberGet,ISubscriberList,ISubscriberInsert,ISubscriberUpdate> {
    protected getFunction = "public.api_subscriber_get";
    protected listFunction = "public.api_subscriber_list";
    protected insertFunction = "public.api_subscriber_insert";
    protected updateFunction = "public.api_subscriber_update";
    protected apiCallName = 'SubscriberApi';
    extensions = new Extensions.default(this)
}
export default new SubscriberApi();
export type {ISubscriberGet,ISubscriberList,ISubscriberInsert,ISubscriberUpdate}
