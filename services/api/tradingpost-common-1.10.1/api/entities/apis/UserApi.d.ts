import { EntityApi } from '../static/EntityApi';
import { IUserGet, IUserList, IUserUpdate } from '../interfaces';
import { User as Extensions } from './extensions';
declare class UserApi extends EntityApi<IUserGet, IUserList, never, IUserUpdate> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: Extensions.default;
}
declare const _default: UserApi;
export default _default;
export type { IUserGet, IUserList, IUserUpdate };
