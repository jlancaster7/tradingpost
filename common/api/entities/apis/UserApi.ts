import { EntityApi } from '../static/EntityApi'
import { IUserGet,IUserList } from '../interfaces'
class UserApi extends EntityApi<IUserGet,IUserList,never,never> {
    protected getFunction = "public.api_user_get";
    protected listFunction = "public.api_user_list";
    protected insertFunction = '';
    protected updateFunction = '';
    /*extensions*/
}
export default new UserApi();
export type {IUserGet,IUserList}
