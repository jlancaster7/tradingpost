import { EntityApi } from "./EntityApi";
import { ISecurityGet, ISecurityList } from '../static/interfaces';
import SecExt from '../extensions/Security';
declare class SecurityApi extends EntityApi<ISecurityGet, ISecurityList, never, never> {
    protected updateFunction: string;
    protected insertFunction: string;
    protected getFunction: string;
    protected listFunction: string;
    protected apiCallName: string;
    extensions: SecExt;
}
declare const _default: SecurityApi;
export default _default;
