import { EntityApiBase } from './EntityApiBase';
export declare abstract class EntityApi<TGet, TList, TInsert, TUpdate> extends EntityApiBase<TGet, TList, TInsert, TUpdate> {
    internal: {
        parent: EntityApi<TGet, TList, TInsert, TUpdate>;
        list: () => Promise<TList[]>;
        get: (id: number | string) => Promise<TGet>;
        update: (id: number | string, update: TUpdate) => Promise<TGet>;
        insert: (insert: TInsert) => Promise<TGet>;
    };
}
