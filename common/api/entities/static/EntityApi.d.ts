import { EntityApiBase } from './EntityApiBase';
export declare type RequestSettings<T = any> = {
    user_id?: string;
    data: T;
};
export declare abstract class EntityApi<TGet, TList, TInsert, TUpdate> extends EntityApiBase<TGet, TList, TInsert, TUpdate> {
    internal: {
        parent: EntityApi<TGet, TList, TInsert, TUpdate>;
        extensions: any;
        list: (settings?: RequestSettings<{
            ids?: (string | number)[] | undefined;
        }> | undefined) => Promise<TList[]>;
        get: (settings?: RequestSettings<any> | undefined) => Promise<TGet>;
        update: (settings?: RequestSettings<TUpdate> | undefined) => Promise<TGet>;
        insert: (settings?: RequestSettings<TInsert> | undefined) => Promise<TGet>;
    };
}
