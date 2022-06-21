import { EntityApi } from '../static/EntityApi';
import { IUserGet, IUserList } from '../interfaces';
declare class UserApi extends EntityApi<IUserGet, IUserList, any, any> {
    getFunction: string;
    listFunction: string;
    insertFunction: string;
    updateFunction: string;
}
declare const _default: UserApi;
export default _default;
export type { IUserGet, IUserList };
