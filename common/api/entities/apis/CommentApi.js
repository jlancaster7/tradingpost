"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class CommentApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_comment_get";
        this.listFunction = "public.api_comment_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Comment.default(this);
    }
}
exports.default = new CommentApi();
