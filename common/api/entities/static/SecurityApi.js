"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityApi = void 0;
const EntityApi_1 = require("./EntityApi");
const Security_1 = __importDefault(require("../extensions/Security"));
class SecurityApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.updateFunction = "";
        this.insertFunction = "";
        this.getFunction = "tp.api_security_get";
        this.listFunction = "tp.api_security_list";
        this.extensions = new Security_1.default(this);
    }
}
exports.SecurityApi = SecurityApi;
exports.default = new SecurityApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VjdXJpdHlBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZWN1cml0eUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwyQ0FBd0M7QUFFeEMsc0VBQTJDO0FBQzNDLE1BQWEsV0FBWSxTQUFRLHFCQUFvRDtJQUFyRjs7UUFDYyxtQkFBYyxHQUFXLEVBQUUsQ0FBQztRQUM1QixtQkFBYyxHQUFXLEVBQUUsQ0FBQztRQUM1QixnQkFBVyxHQUFXLHFCQUFxQixDQUFDO1FBQzVDLGlCQUFZLEdBQVcsc0JBQXNCLENBQUE7UUFDdkQsZUFBVSxHQUFHLElBQUksa0JBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0NBQUE7QUFORCxrQ0FNQztBQUVELGtCQUFlLElBQUksV0FBVyxFQUFFLENBQUMifQ==