import { EntityApi } from '../static/EntityApi'
import { IPlatformClaimGet,IPlatformClaimList } from '../interfaces'
class PlatformClaimApi extends EntityApi<IPlatformClaimGet,IPlatformClaimList,any,any> {
    getFunction = "public.api_platform_claim_get";
    listFunction = "public.api_platform_claim_list";
    insertFunction = "public.api_platform_claim_insert";
    updateFunction = "public.api_platform_claim_update";
    /*extensions*/
}
export default new PlatformClaimApi();
export type {IPlatformClaimGet,IPlatformClaimList}
