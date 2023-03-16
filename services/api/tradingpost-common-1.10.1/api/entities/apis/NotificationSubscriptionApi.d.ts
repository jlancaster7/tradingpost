import { EntityApi } from '../static/EntityApi';
import { NotificationSubscription as Extensions } from './extensions';
declare class NotificationSubscriptionApi extends EntityApi<never, never, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: NotificationSubscriptionApi;
export default _default;
export type {};
