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
                this.list = () => {
                    if (!this.list) {
                        throw {
                            message: "List is not implemented on this api"
                        };
                    }
                    return (0, pool_1.execProc)(this.parent.listFunction);
                };
                this.get = (id, settings) => {
                    if (!this.get) {
                        throw {
                            message: "Get is not implemented on this api"
                        };
                    }
                    return (0, pool_1.execProcOne)(this.parent.getFunction, Object.assign(Object.assign({}, settings), { data: { id } }));
                };
                this.update = (id, update, settings) => {
                    if (!this.update) {
                        throw {
                            message: "Update is not implemented on this api"
                        };
                    }
                    const errs = this.parent.validate(false);
                    //Need to change this
                    if (errs)
                        throw (0, errors_1.makeError)("VALIDATION_ERROR", errs);
                    return (0, pool_1.execProcOne)(this.parent.updateFunction, Object.assign(Object.assign({}, settings), { data: Object.assign({ id }, update) }));
                };
                this.insert = (insert, settings) => {
                    if (!this.insert) {
                        throw {
                            message: "Insert is not implemented on this api"
                        };
                    }
                    const errs = this.parent.validate(true);
                    //Need to change this
                    if (errs)
                        throw (0, errors_1.makeError)("VALIDATION_ERROR", errs);
                    return (0, pool_1.execProcOne)(this.parent.insertFunction, Object.assign(Object.assign({}, settings), { data: insert }));
                };
                this.parent = parent;
            }
        }(this);
    }
}
exports.EntityApi = EntityApi;
