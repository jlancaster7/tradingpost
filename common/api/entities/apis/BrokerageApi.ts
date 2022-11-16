import { EntityApi } from '../static/EntityApi'
import {  } from '../interfaces'
import { Brokerage as Extensions } from './extensions'
class BrokerageApi extends EntityApi<never,never,never,never> {
    protected getFunction = '';
    protected listFunction = '';
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'BrokerageApi';
    extensions = new Extensions.default(this)
}
export default new BrokerageApi();
export type {}
