"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityApi = void 0;
const pool_1 = require("../static/pool");
const EntityApiBase_1 = require("./EntityApiBase");
const errors_1 = require("../../errors");
const fs_1 = require("fs");
const path_1 = require("path");
function makeExtensions(name) {
    const path = (0, path_1.join)(__dirname, "../", "extensions", name.substring(0, name.length - 3) + ".server");
    //console.log(path);
    if ((0, fs_1.existsSync)(path + ".js")) {
        const returned = require(path).default;
        //    console.log("##############################FOUND THE FILE" + Object.keys(returned));
        return returned;
    }
    else {
        //  console.log("######################DID NOTTTTTTT FOUND THE FILE");
        return {};
    }
}
class EntityApi extends EntityApiBase_1.EntityApiBase {
    constructor() {
        super(...arguments);
        this.internal = new class {
            constructor(parent) {
                this.list = (settings) => {
                    if (!this.list) {
                        throw {
                            message: "List is not implemented on this api"
                        };
                    }
                    return (0, pool_1.execProc)(this.parent.listFunction, settings);
                };
                this.get = (settings) => {
                    if (!this.get) {
                        throw {
                            message: "Get is not implemented on this api"
                        };
                    }
                    return (0, pool_1.execProcOne)(this.parent.getFunction, settings);
                };
                this.update = (settings) => {
                    if (!this.update) {
                        throw {
                            message: "Update is not implemented on this api"
                        };
                    }
                    const errs = this.parent.validate(false);
                    //Need to change this
                    if (errs)
                        throw (0, errors_1.makeError)("VALIDATION_ERROR", errs);
                    return (0, pool_1.execProcOne)(this.parent.updateFunction, settings);
                };
                this.insert = (settings) => {
                    if (!this.insert) {
                        throw {
                            message: "Insert is not implemented on this api"
                        };
                    }
                    const errs = this.parent.validate(true);
                    //Need to change this
                    if (errs)
                        throw (0, errors_1.makeError)("VALIDATION_ERROR", errs);
                    return (0, pool_1.execProcOne)(this.parent.insertFunction, settings);
                };
                this.parent = parent;
                this.extensions = makeExtensions(this.parent.constructor.name);
            }
        }(this);
    }
}
exports.EntityApi = EntityApi;
