import { EntityApi } from '../static/EntityApi'
import { IUserGet,IUserList } from '../interfaces'
class UserApi extends EntityApi<IUserGet,IUserList,any,any> {
    protected getFunction = "public.api_user_get";
    protected listFunction = "public.api_user_list";
    protected insertFunction = "public.api_user_insert";
    protected updateFunction = "public.api_user_update";
    /*extensions*/
}
export default new UserApi();
export type {IUserGet,IUserList}
