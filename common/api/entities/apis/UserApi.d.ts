import { EntityApi } from '../static/EntityApi';
import { IUserGet, IUserList } from '../interfaces';
declare class UserApi extends EntityApi<IUserGet, IUserList, never, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
}
declare const _default: UserApi;
export default _default;
export type { IUserGet, IUserList };
