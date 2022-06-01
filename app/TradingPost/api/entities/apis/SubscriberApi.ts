import { EntityApi } from './EntityApi'
import { ISubscriberGet,ISubscriberList } from '../interfaces'
class SubscriberApi extends EntityApi<ISubscriberGet,ISubscriberList,any,any> {
    getFunction = "public.api_subscriber_get";
    listFunction = "public.api_subscriber_list";
    insertFunction = "public.api_subscriber_insert";
    updateFunction = "public.api_subscriber_update";
    /*extensions*/
}
export default new SubscriberApi();
export type {ISubscriberGet,ISubscriberList}
