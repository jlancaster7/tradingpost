import { EntityApi } from '../static/EntityApi';
declare class TradeApi extends EntityApi<never, never, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: import("../extensions").Extension;
}
declare const _default: TradeApi;
export default _default;
export type {};
