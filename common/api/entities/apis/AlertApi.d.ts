import { EntityApi } from '../static/EntityApi';
import { IAlertList } from '../interfaces';
declare class AlertApi extends EntityApi<never, IAlertList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    extensions: import("../extensions").Extension;
}
declare const _default: AlertApi;
export default _default;
export type { IAlertList };
