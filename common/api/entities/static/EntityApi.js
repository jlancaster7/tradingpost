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
    console.log(path);
    if ((0, fs_1.existsSync)(path + ".js")) {
        const returned = require(path).default;
        console.log("##############################FOUND THE FILE" + Object.keys(returned));
        return returned;
    }
    else {
        console.log("######################DID NOTTTTTTT FOUND THE FILE");
        return {};
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5QXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRW50aXR5QXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlDQUF1RDtBQUN2RCxtREFBZ0Q7QUFDaEQseUNBQXdDO0FBQ3hDLDJCQUErQjtBQUMvQiwrQkFBNEI7QUFRNUIsU0FBUyxjQUFjLENBQUMsSUFBWTtJQUNoQyxNQUFNLElBQUksR0FBRyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO0lBQ2xHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEIsSUFBSSxJQUFBLGVBQVUsRUFBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7UUFDMUIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLDhDQUE4QyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNwRixPQUFPLFFBQVEsQ0FBQztLQUNuQjtTQUFNO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sRUFBRSxDQUFDO0tBQ2I7QUFDTCxDQUFDO0FBRUQsTUFBc0IsU0FBeUMsU0FBUSw2QkFBNEM7SUFBbkg7O1FBQ0ksYUFBUSxHQUFHLElBQUk7WUFJWCxZQUFZLE1BQWdEO2dCQUk1RCxTQUFJLEdBQUcsR0FBRyxFQUFFO29CQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNaLE1BQU07NEJBQ0YsT0FBTyxFQUFFLHFDQUFxQzt5QkFDakQsQ0FBQTtxQkFDSjtvQkFDRCxPQUFPLElBQUEsZUFBUSxFQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3JELENBQUMsQ0FBQTtnQkFFRCxRQUFHLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEVBQUU7b0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNYLE1BQU07NEJBQ0YsT0FBTyxFQUFFLG9DQUFvQzt5QkFDaEQsQ0FBQTtxQkFDSjtvQkFDRCxPQUFPLElBQUEsa0JBQVcsRUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDaEUsQ0FBQyxDQUFBO2dCQUNELFdBQU0sR0FBRyxDQUFDLFFBQW1DLEVBQUUsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ2QsTUFBTTs0QkFDRixPQUFPLEVBQUUsdUNBQXVDO3lCQUNuRCxDQUFBO3FCQUNKO29CQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN6QyxxQkFBcUI7b0JBQ3JCLElBQUksSUFBSTt3QkFDSixNQUFNLElBQUEsa0JBQVMsRUFBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDOUMsT0FBTyxJQUFBLGtCQUFXLEVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQTtnQkFDRCxXQUFNLEdBQUcsQ0FBQyxRQUFtQyxFQUFFLEVBQUU7b0JBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNkLE1BQU07NEJBQ0YsT0FBTyxFQUFFLHVDQUF1Qzt5QkFDbkQsQ0FBQTtxQkFDSjtvQkFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEMscUJBQXFCO29CQUNyQixJQUFJLElBQUk7d0JBQ0osTUFBTSxJQUFBLGtCQUFTLEVBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBRTlDLE9BQU8sSUFBQSxrQkFBVyxFQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUE7Z0JBNUNHLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNsRSxDQUFDO1NBMkNKLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDWCxDQUFDO0NBQUE7QUFwREQsOEJBb0RDIn0=