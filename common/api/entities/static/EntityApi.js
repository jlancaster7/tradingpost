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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5QXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRW50aXR5QXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlDQUF1RDtBQUN2RCxtREFBZ0Q7QUFDaEQseUNBQXdDO0FBQ3hDLDJCQUErQjtBQUMvQiwrQkFBNEI7QUFRNUIsU0FBUyxjQUFjLENBQUMsSUFBWTtJQUNoQyxNQUFNLElBQUksR0FBRyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO0lBQ2xHLG9CQUFvQjtJQUNwQixJQUFJLElBQUEsZUFBVSxFQUFDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtRQUMxQixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzNDLDBGQUEwRjtRQUN0RixPQUFPLFFBQVEsQ0FBQztLQUNuQjtTQUFNO1FBQ0wsc0VBQXNFO1FBQ3BFLE9BQU8sRUFBRSxDQUFDO0tBQ2I7QUFDTCxDQUFDO0FBRUQsTUFBc0IsU0FBeUMsU0FBUSw2QkFBNEM7SUFBbkg7O1FBQ0ksYUFBUSxHQUFHLElBQUk7WUFJWCxZQUFZLE1BQWdEO2dCQUk1RCxTQUFJLEdBQUcsQ0FBQyxRQUVOLEVBQUUsRUFBRTtvQkFDRixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDWixNQUFNOzRCQUNGLE9BQU8sRUFBRSxxQ0FBcUM7eUJBQ2pELENBQUE7cUJBQ0o7b0JBQ0QsT0FBTyxJQUFBLGVBQVEsRUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDL0QsQ0FBQyxDQUFBO2dCQUVELFFBQUcsR0FBRyxDQUFDLFFBQTBCLEVBQUUsRUFBRTtvQkFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7d0JBQ1gsTUFBTTs0QkFDRixPQUFPLEVBQUUsb0NBQW9DO3lCQUNoRCxDQUFBO3FCQUNKO29CQUNELE9BQU8sSUFBQSxrQkFBVyxFQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRSxDQUFDLENBQUE7Z0JBQ0QsV0FBTSxHQUFHLENBQUMsUUFBbUMsRUFBRSxFQUFFO29CQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDZCxNQUFNOzRCQUNGLE9BQU8sRUFBRSx1Q0FBdUM7eUJBQ25ELENBQUE7cUJBQ0o7b0JBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3pDLHFCQUFxQjtvQkFDckIsSUFBSSxJQUFJO3dCQUNKLE1BQU0sSUFBQSxrQkFBUyxFQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM5QyxPQUFPLElBQUEsa0JBQVcsRUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFBO2dCQUNELFdBQU0sR0FBRyxDQUFDLFFBQW1DLEVBQUUsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ2QsTUFBTTs0QkFDRixPQUFPLEVBQUUsdUNBQXVDO3lCQUNuRCxDQUFBO3FCQUNKO29CQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN4QyxxQkFBcUI7b0JBQ3JCLElBQUksSUFBSTt3QkFDSixNQUFNLElBQUEsa0JBQVMsRUFBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFOUMsT0FBTyxJQUFBLGtCQUFXLEVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQTtnQkE5Q0csSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ2xFLENBQUM7U0E2Q0osQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNYLENBQUM7Q0FBQTtBQXRERCw4QkFzREMifQ==