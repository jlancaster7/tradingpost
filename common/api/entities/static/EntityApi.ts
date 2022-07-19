
import { execProc, execProcOne } from '../static/pool';
import { EntityApiBase } from './EntityApiBase';
import { makeError } from '../../errors'

export type RequestSettings<T = any> = {
    user_id?: string,
    data: T
    //add pagination stuff here too
}

export abstract class EntityApi<TGet, TList, TInsert, TUpdate> extends EntityApiBase<TGet, TList, TInsert, TUpdate> {
    internal = new class {
        parent: EntityApi<TGet, TList, TInsert, TUpdate>;
        constructor(parent: EntityApi<TGet, TList, TInsert, TUpdate>) {
            this.parent = parent;
        }
        list = () => {
            if (!this.list) {
                throw {
                    message: "List is not implemented on this api"
                }
            }
            return execProc<TList>(this.parent.listFunction);
        }

        get = (settings?: RequestSettings) => {
            if (!this.get) {
                throw {
                    message: "Get is not implemented on this api"
                }
            }
            return execProcOne<TGet>(this.parent.getFunction, settings);
        }
        update = (settings?: RequestSettings<TUpdate>) => {
            if (!this.update) {
                throw {
                    message: "Update is not implemented on this api"
                }
            }
            const errs = this.parent.validate(false);
            //Need to change this
            if (errs)
                throw makeError("VALIDATION_ERROR", errs);
            return execProcOne<TGet>(this.parent.updateFunction, settings);
        }
        insert = (settings?: RequestSettings<TInsert>) => {
            if (!this.insert) {
                throw {
                    message: "Insert is not implemented on this api"
                }
            }
            const errs = this.parent.validate(true);
            //Need to change this
            if (errs)
                throw makeError("VALIDATION_ERROR", errs);

            return execProcOne<TGet>(this.parent.insertFunction, settings);
        }
    }(this)
}

