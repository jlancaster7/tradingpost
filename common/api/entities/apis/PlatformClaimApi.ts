import { EntityApi } from '../static/EntityApi'
import { IPlatformClaimGet,IPlatformClaimList } from '../interfaces'
class PlatformClaimApi extends EntityApi<IPlatformClaimGet,IPlatformClaimList,any,any> {
    protected getFunction = "public.api_platform_claim_get";
    protected listFunction = "public.api_platform_claim_list";
    protected insertFunction = "public.api_platform_claim_insert";
    protected updateFunction = "public.api_platform_claim_update";
    /*extensions*/
}
export default new PlatformClaimApi();
export type {IPlatformClaimGet,IPlatformClaimList}
