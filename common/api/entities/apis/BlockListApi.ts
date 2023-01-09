import { EntityApi } from '../static/EntityApi'
import { IBlockListGet,IBlockListList,IBlockListInsert } from '../interfaces'
import { BlockList as Extensions } from './extensions'
class BlockListApi extends EntityApi<IBlockListGet,IBlockListList,IBlockListInsert,never> {
    protected getFunction = "public.api_block_list_get";
    protected listFunction = "public.api_block_list_list";
    protected insertFunction = "public.api_block_list_insert";
    protected updateFunction = '';
    protected apiCallName = 'BlockListApi';
    extensions = new Extensions.default(this)
}
export default new BlockListApi();
export type {IBlockListGet,IBlockListList,IBlockListInsert}
