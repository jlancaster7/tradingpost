import { EntityApi } from '../static/EntityApi';
import { IBlockListGet, IBlockListList, IBlockListInsert } from '../interfaces';
declare class BlockListApi extends EntityApi<IBlockListGet, IBlockListList, IBlockListInsert, never> {
    protected getFunction: string;
    protected listFunction: string;
    protected insertFunction: string;
    protected updateFunction: string;
    protected apiCallName: string;
    extensions: import("../extensions").Extension;
}
declare const _default: BlockListApi;
export default _default;
export type { IBlockListGet, IBlockListList, IBlockListInsert };
