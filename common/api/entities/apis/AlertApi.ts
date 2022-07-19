import { EntityApi } from '../static/EntityApi'
import { IAlertGet,IAlertList } from '../interfaces'
import { Alert as Extensions } from './extensions'
class AlertApi extends EntityApi<IAlertGet,IAlertList,never,never> {
    protected getFunction = "public.api_alert_get";
    protected listFunction = "public.api_alert_list";
    protected insertFunction = '';
    protected updateFunction = '';
    extensions = new Extensions.default(this)
}
export default new AlertApi();
export type {IAlertGet,IAlertList}
