"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
class WatchlistApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_watchlist_get";
        this.listFunction = "public.api_watchlist_list";
        this.insertFunction = "public.api_watchlist_insert";
        this.updateFunction = "public.api_watchlist_update";
        /*extensions*/
    }
}
exports.default = new WatchlistApi();
