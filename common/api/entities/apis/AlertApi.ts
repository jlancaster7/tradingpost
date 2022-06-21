import { EntityApi } from '../static/EntityApi'
import { IAlertGet,IAlertList } from '../interfaces'
class AlertApi extends EntityApi<IAlertGet,IAlertList,any,any> {
    protected getFunction = "public.api_alert_get";
    protected listFunction = "public.api_alert_list";
    protected insertFunction = "public.api_alert_insert";
    protected updateFunction = "public.api_alert_update";
    /*extensions*/
}
export default new AlertApi();
export type {IAlertGet,IAlertList}
