import { EntityApi } from '../static/EntityApi';
import { Notification as Extensions } from './extensions';
declare class NotificationApi extends EntityApi<never, never, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: NotificationApi;
export default _default;
export type {};
