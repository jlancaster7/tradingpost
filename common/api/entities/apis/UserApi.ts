import { EntityApi } from '../static/EntityApi'
import { IUserGet,IUserList } from '../interfaces'
class UserApi extends EntityApi<IUserGet,IUserList,any,any> {
    getFunction = "public.api_user_get";
    listFunction = "public.api_user_list";
    insertFunction = "public.api_user_insert";
    updateFunction = "public.api_user_update";
    /*extensions*/
}
export default new UserApi();
export type {IUserGet,IUserList}
