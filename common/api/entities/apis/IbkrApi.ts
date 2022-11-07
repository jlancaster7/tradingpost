import { EntityApi } from '../static/EntityApi'
import {  } from '../interfaces'
import { Ibkr as Extensions } from './extensions'
class IbkrApi extends EntityApi<never,never,never,never> {
    protected getFunction = '';
    protected listFunction = '';
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'IbkrApi';
    extensions = new Extensions.default(this)
}
export default new IbkrApi();
export type {}
