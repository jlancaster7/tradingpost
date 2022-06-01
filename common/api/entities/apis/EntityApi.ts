
import { execProc, execProcOne } from '../static/pool';
import { EntityApiBase } from './EntityApiBase';

export abstract class EntityApi<TGet, TList, TInsert, TUpdate> extends EntityApiBase<TGet, TList, TInsert, TUpdate> {
    internal = new class {
        parent: EntityApi<TGet, TList, TInsert, TUpdate>;
        constructor(parent: EntityApi<TGet, TList, TInsert, TUpdate>) {
            this.parent = parent;
        }
        list = () => execProc<TList>(this.parent.listFunction);

        get = (id: number | string) => {
            return execProcOne<TGet>(this.parent.getFunction, {
                data: { id }
            });
        }

        update = (id: number | string, update: TUpdate) => {
            const errs = this.parent.validate(false);
            if (errs)
                throw makeError("VALIDATION_ERROR", errs);
            return execProcOne<TGet>(this.parent.updateFunction, { data: { id, ...update } });
        }
        insert = (insert: TInsert) => {
            const errs = this.parent.validate(true);
            if (errs)
                throw makeError("VALIDATION_ERROR", errs);

            return execProcOne<TGet>(this.parent.insertFunction, { data: insert });
        }
    }(this)
}


