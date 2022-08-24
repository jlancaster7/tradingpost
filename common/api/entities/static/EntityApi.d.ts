import { EntityApiBase } from './EntityApiBase';
export declare type RequestSettings<T = any> = {
    user_id?: string;
    data: T;
    limit?: number;
    page?: number;
};
export declare abstract class EntityApi<TGet, TList, TInsert, TUpdate> extends EntityApiBase<TGet, TList, TInsert, TUpdate> {
    internal: {
        parent: EntityApi<TGet, TList, TInsert, TUpdate>;
        extensions: any;
        list: (settings?: RequestSettings<{
            ids?: (string | number)[];
        }>) => Promise<TList[]>;
        get: (settings?: RequestSettings) => Promise<TGet>;
        update: (settings?: RequestSettings<TUpdate>) => Promise<TGet>;
        insert: (settings?: RequestSettings<TInsert>) => Promise<TGet>;
    };
}
