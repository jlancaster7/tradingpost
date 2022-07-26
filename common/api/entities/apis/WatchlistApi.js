"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class WatchlistApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_watchlist_get";
        this.listFunction = "public.api_watchlist_list";
        this.insertFunction = "public.api_watchlist_insert";
        this.updateFunction = "public.api_watchlist_update";
        this.extensions = new extensions_1.Watchlist.default(this);
    }
}
exports.default = new WatchlistApi();
