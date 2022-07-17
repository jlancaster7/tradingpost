"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityApi = void 0;
const EntityApi_1 = require("./EntityApi");
class SecurityApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.updateFunction = "";
        this.insertFunction = "";
        this.getFunction = "tp.api_security_get";
        this.listFunction = "tp.api_security_list";
    }
}
exports.SecurityApi = SecurityApi;
exports.default = new SecurityApi();
