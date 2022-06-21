import { EntityApi } from '../static/EntityApi';
import { IPlatformClaimGet, IPlatformClaimList } from '../interfaces';
declare class PlatformClaimApi extends EntityApi<IPlatformClaimGet, IPlatformClaimList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: PlatformClaimApi;
export default _default;
export type { IPlatformClaimGet, IPlatformClaimList };
