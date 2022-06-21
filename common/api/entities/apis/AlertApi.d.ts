import { EntityApi } from '../static/EntityApi';
import { IAlertGet, IAlertList } from '../interfaces';
declare class AlertApi extends EntityApi<IAlertGet, IAlertList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: AlertApi;
export default _default;
export type { IAlertGet, IAlertList };
