"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class WatchlistSavedApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = '';
        this.listFunction = "public.api_watchlist_saved_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.apiCallName = 'WatchlistSavedApi';
        this.extensions = new extensions_1.WatchlistSaved.default(this);
    }
}
exports.default = new WatchlistSavedApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2F0Y2hsaXN0U2F2ZWRBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJXYXRjaGxpc3RTYXZlZEFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUErQztBQUUvQyw2Q0FBMkQ7QUFDM0QsTUFBTSxpQkFBa0IsU0FBUSxxQkFBZ0Q7SUFBaEY7O1FBQ2MsZ0JBQVcsR0FBRyxFQUFFLENBQUM7UUFDakIsaUJBQVksR0FBRyxpQ0FBaUMsQ0FBQztRQUNqRCxtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQixnQkFBVyxHQUFHLG1CQUFtQixDQUFDO1FBQzVDLGVBQVUsR0FBRyxJQUFJLDJCQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLENBQUM7Q0FBQTtBQUNELGtCQUFlLElBQUksaUJBQWlCLEVBQUUsQ0FBQyJ9