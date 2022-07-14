import { EntityApiBase } from './EntityApiBase';
export declare type RequestSettings = {
    user_id?: string;
};
export declare abstract class EntityApi<TGet, TList, TInsert, TUpdate> extends EntityApiBase<TGet, TList, TInsert, TUpdate> {
    internal: {
        parent: EntityApi<TGet, TList, TInsert, TUpdate>;
        list: () => Promise<TList[]>;
        get: (id: number | string, settings?: RequestSettings | undefined) => Promise<TGet>;
        update: (id: number | string, update: TUpdate, settings?: RequestSettings | undefined) => Promise<TGet>;
        insert: (insert: TInsert, settings?: RequestSettings | undefined) => Promise<TGet>;
    };
}
