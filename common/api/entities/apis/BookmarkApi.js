"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class BookmarkApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_bookmark_get";
        this.listFunction = "public.api_bookmark_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Bookmark.default(this);
    }
}
exports.default = new BookmarkApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9va21hcmtBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCb29rbWFya0FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUErQztBQUUvQyw2Q0FBcUQ7QUFDckQsTUFBTSxXQUFZLFNBQVEscUJBQWlEO0lBQTNFOztRQUNjLGdCQUFXLEdBQUcseUJBQXlCLENBQUM7UUFDeEMsaUJBQVksR0FBRywwQkFBMEIsQ0FBQztRQUMxQyxtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUM5QixlQUFVLEdBQUcsSUFBSSxxQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0NBQUE7QUFDRCxrQkFBZSxJQUFJLFdBQVcsRUFBRSxDQUFDIn0=