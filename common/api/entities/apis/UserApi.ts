import { EntityApi } from '../static/EntityApi'
import { IUserGet,IUserList,IUserUpdate } from '../interfaces'
import { User as Extensions } from './extensions'
class UserApi extends EntityApi<IUserGet,IUserList,never,IUserUpdate> {
    protected getFunction = "public.api_user_get";
    protected listFunction = "public.api_user_list";
    protected insertFunction = '';
    protected updateFunction = "public.api_user_update";
    extensions = new Extensions.default(this)
}
export default new UserApi();
export type {IUserGet,IUserList,IUserUpdate}
