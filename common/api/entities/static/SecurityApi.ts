import { EntityApi } from "./EntityApi";
import { ISecurityGet, ISecurityList } from '../static/interfaces'
import SecExt from '../extensions/Security'
class SecurityApi extends EntityApi<ISecurityGet, ISecurityList, never, never> {
    protected updateFunction: string = "";
    protected insertFunction: string = "";
    protected getFunction: string = "tp.api_security_get";
    protected listFunction: string = "tp.api_security_list"
    protected apiCallName: string = "SecurityApi"
    extensions = new SecExt(this)
}

export default new SecurityApi();
//export { ISecurityGet, ISecurityList } 