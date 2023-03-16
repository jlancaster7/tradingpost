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
        this.apiCallName = 'WatchlistApi';
        this.extensions = new extensions_1.Watchlist.default(this);
    }
}
exports.default = new WatchlistApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2F0Y2hsaXN0QXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiV2F0Y2hsaXN0QXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBRS9DLDZDQUFzRDtBQUN0RCxNQUFNLFlBQWEsU0FBUSxxQkFBeUU7SUFBcEc7O1FBQ2MsZ0JBQVcsR0FBRywwQkFBMEIsQ0FBQztRQUN6QyxpQkFBWSxHQUFHLDJCQUEyQixDQUFDO1FBQzNDLG1CQUFjLEdBQUcsNkJBQTZCLENBQUM7UUFDL0MsbUJBQWMsR0FBRyw2QkFBNkIsQ0FBQztRQUMvQyxnQkFBVyxHQUFHLGNBQWMsQ0FBQztRQUN2QyxlQUFVLEdBQUcsSUFBSSxzQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0NBQUE7QUFDRCxrQkFBZSxJQUFJLFlBQVksRUFBRSxDQUFDIn0=