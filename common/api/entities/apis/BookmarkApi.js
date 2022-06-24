"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
class BookmarkApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_bookmark_get";
        this.listFunction = "public.api_bookmark_list";
        this.insertFunction = "public.api_bookmark_insert";
        this.updateFunction = "public.api_bookmark_update";
        /*extensions*/
    }
}
exports.default = new BookmarkApi();
