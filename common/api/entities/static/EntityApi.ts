import { execProc, execProcOne } from '../static/pool';
import { EntityApiBase } from './EntityApiBase';
import { makeError } from '../../errors'
import { existsSync } from 'fs'
import { join } from 'path';

export type RequestSettings<T = any> = {
    user_id?: string,
    data: T,
    limit?: number
    page?: number

}

function makeExtensions(name: string) {
    const path = join(__dirname, "../", "extensions", name.substring(0, name.length - 3) + ".server");
    //console.log(path);
    if (existsSync(path + ".js")) {
        const returned = require(path).default;
        // console.log("##############################FOUND THE FILE" + Object.keys(returned));
        return returned;
    } else {
        // console.log("######################DID NOTTTTTTT FOUND THE FILE");
        return {};
    }
}

export abstract class EntityApi<TGet, TList, TInsert, TUpdate> extends EntityApiBase<TGet, TList, TInsert, TUpdate> {
    internal = new class {

        parent: EntityApi<TGet, TList, TInsert, TUpdate>;
        extensions: any
        constructor(parent: EntityApi<TGet, TList, TInsert, TUpdate>) {
            this.parent = parent;
            this.extensions = makeExtensions(this.parent.constructor.name)
        }
        list = (settings?: RequestSettings<{
            ids?: (string | number)[]
        }>) => {
            if (!this.list) {
                throw {
                    message: "List is not implemented on this api"
                }
            }
            return execProc<TList>(this.parent.listFunction, settings);
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

