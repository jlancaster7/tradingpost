import { EntityApi } from '../static/EntityApi';
import { Ibkr as Extensions } from './extensions';
declare class IbkrApi extends EntityApi<never, never, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: IbkrApi;
export default _default;
export type {};
