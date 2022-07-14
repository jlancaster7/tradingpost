import { EntityApi } from '../static/EntityApi';
import { IPlatformClaimGet, IPlatformClaimList } from '../interfaces';
declare class PlatformClaimApi extends EntityApi<IPlatformClaimGet, IPlatformClaimList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
}
declare const _default: PlatformClaimApi;
export default _default;
export type { IPlatformClaimGet, IPlatformClaimList };
