import { EntityApi } from '../static/EntityApi'
import { IPlatformClaimGet,IPlatformClaimList } from '../interfaces'
class PlatformClaimApi extends EntityApi<IPlatformClaimGet,IPlatformClaimList,never,never> {
    protected getFunction = "public.api_platform_claim_get";
    protected listFunction = "public.api_platform_claim_list";
    protected insertFunction = '';
    protected updateFunction = '';
    /*extensions*/
}
export default new PlatformClaimApi();
export type {IPlatformClaimGet,IPlatformClaimList}
