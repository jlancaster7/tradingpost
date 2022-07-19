"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class UserApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_user_get";
        this.listFunction = "public.api_user_list";
        this.insertFunction = '';
        this.updateFunction = "public.api_user_update";
        this.extensions = new extensions_1.User.default(this);
    }
}
exports.default = new UserApi();
