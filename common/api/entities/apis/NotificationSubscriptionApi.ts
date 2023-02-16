import { EntityApi } from '../static/EntityApi'
import {  } from '../interfaces'
import { NotificationSubscription as Extensions } from './extensions'
class NotificationSubscriptionApi extends EntityApi<never,never,never,never> {
    protected getFunction = '';
    protected listFunction = '';
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'NotificationSubscriptionApi';
    extensions = new Extensions.default(this)
}
export default new NotificationSubscriptionApi();
export type {}
