"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("./EntityApi");
class UpvoteApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_upvote_get";
        this.listFunction = "public.api_upvote_list";
        this.insertFunction = "public.api_upvote_insert";
        this.updateFunction = "public.api_upvote_update";
        /*extensions*/
    }
}
exports.default = new UpvoteApi();
