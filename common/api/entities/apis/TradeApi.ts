import { EntityApi } from '../static/EntityApi'
import {  } from '../interfaces'
import { Trade as Extensions } from './extensions'
class TradeApi extends EntityApi<never,never,never,never> {
    protected getFunction = '';
    protected listFunction = '';
    protected insertFunction = '';
    protected updateFunction = '';
    extensions = new Extensions.default(this)
}
export default new TradeApi();
export type {}
