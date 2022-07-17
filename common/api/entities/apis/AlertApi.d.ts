import { EntityApi } from '../static/EntityApi';
import { IAlertGet, IAlertList } from '../interfaces';
declare class AlertApi extends EntityApi<IAlertGet, IAlertList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
}
declare const _default: AlertApi;
export default _default;
export type { IAlertGet, IAlertList };
