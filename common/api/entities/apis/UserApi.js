"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("./EntityApi");
class UserApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_user_get";
        this.listFunction = "public.api_user_list";
        this.insertFunction = "public.api_user_insert";
        this.updateFunction = "public.api_user_update";
        /*extensions*/
    }
}
exports.default = new UserApi();
