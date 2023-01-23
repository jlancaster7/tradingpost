"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class WatchlistItemApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_watchlist_item_get";
        this.listFunction = "public.api_watchlist_item_list";
        this.insertFunction = "public.api_watchlist_item_insert";
        this.updateFunction = '';
        this.apiCallName = 'WatchlistItemApi';
        this.extensions = new extensions_1.WatchlistItem.default(this);
    }
}
exports.default = new WatchlistItemApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2F0Y2hsaXN0SXRlbUFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIldhdGNobGlzdEl0ZW1BcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFFL0MsNkNBQTBEO0FBQzFELE1BQU0sZ0JBQWlCLFNBQVEscUJBQTBFO0lBQXpHOztRQUNjLGdCQUFXLEdBQUcsK0JBQStCLENBQUM7UUFDOUMsaUJBQVksR0FBRyxnQ0FBZ0MsQ0FBQztRQUNoRCxtQkFBYyxHQUFHLGtDQUFrQyxDQUFDO1FBQ3BELG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLGdCQUFXLEdBQUcsa0JBQWtCLENBQUM7UUFDM0MsZUFBVSxHQUFHLElBQUksMEJBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDIn0=