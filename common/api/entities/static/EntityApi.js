"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityApi = void 0;
const pool_1 = require("../static/pool");
const EntityApiBase_1 = require("./EntityApiBase");
const errors_1 = require("../../errors");
class EntityApi extends EntityApiBase_1.EntityApiBase {
    constructor() {
        super(...arguments);
        this.internal = new class {
            constructor(parent) {
                this.list = () => (0, pool_1.execProc)(this.parent.listFunction);
                this.get = (id) => {
                    return (0, pool_1.execProcOne)(this.parent.getFunction, {
                        data: { id }
                    });
                };
                this.update = (id, update) => {
                    const errs = this.parent.validate(false);
                    if (errs)
                        throw (0, errors_1.makeError)("VALIDATION_ERROR", errs);
                    return (0, pool_1.execProcOne)(this.parent.updateFunction, { data: Object.assign({ id }, update) });
                };
                this.insert = (insert) => {
                    const errs = this.parent.validate(true);
                    if (errs)
                        throw (0, errors_1.makeError)("VALIDATION_ERROR", errs);
                    return (0, pool_1.execProcOne)(this.parent.insertFunction, { data: insert });
                };
                this.parent = parent;
            }
        }(this);
    }
}
exports.EntityApi = EntityApi;
