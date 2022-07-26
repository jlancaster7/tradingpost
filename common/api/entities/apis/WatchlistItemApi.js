"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class WatchlistItemApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_watchlist_item_get";
        this.listFunction = "public.api_watchlist_item_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.WatchlistItem.default(this);
    }
}
exports.default = new WatchlistItemApi();
