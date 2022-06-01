import { EntityApi } from './EntityApi'
import { IAlertGet,IAlertList } from '../interfaces'
class AlertApi extends EntityApi<IAlertGet,IAlertList,any,any> {
    getFunction = "public.api_alert_get";
    listFunction = "public.api_alert_list";
    insertFunction = "public.api_alert_insert";
    updateFunction = "public.api_alert_update";
    /*extensions*/
}
export default new AlertApi();
export type {IAlertGet,IAlertList}
