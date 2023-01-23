import { EntityApi } from '../static/EntityApi';
import { Brokerage as Extensions } from './extensions';
declare class BrokerageApi extends EntityApi<never, never, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: BrokerageApi;
export default _default;
export type {};
