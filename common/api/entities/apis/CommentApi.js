"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
class CommentApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_comment_get";
        this.listFunction = "public.api_comment_list";
        this.insertFunction = "public.api_comment_insert";
        this.updateFunction = "public.api_comment_update";
        /*extensions*/
    }
}
exports.default = new CommentApi();
