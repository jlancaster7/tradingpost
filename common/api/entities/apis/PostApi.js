"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("./EntityApi");
class PostApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_post_get";
        this.listFunction = "public.api_post_list";
        this.insertFunction = "public.api_post_insert";
        this.updateFunction = "public.api_post_update";
        /*extensions*/
    }
}
exports.default = new PostApi();
