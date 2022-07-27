"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class UpvoteApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_upvote_get";
        this.listFunction = "public.api_upvote_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Upvote.default(this);
    }
}
exports.default = new UpvoteApi();
