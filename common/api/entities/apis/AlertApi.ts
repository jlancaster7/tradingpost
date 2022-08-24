import { EntityApi } from '../static/EntityApi'
import { IAlertList } from '../interfaces'
import { Alert as Extensions } from './extensions'
class AlertApi extends EntityApi<never,IAlertList,never,never> {
    protected getFunction = '';
    protected listFunction = "public.api_alert_list";
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'AlertApi';
    extensions = new Extensions.default(this)
}
export default new AlertApi();
export type {IAlertList}
