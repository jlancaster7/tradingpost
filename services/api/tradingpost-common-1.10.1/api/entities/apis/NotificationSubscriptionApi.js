"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class NotificationSubscriptionApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = '';
        this.listFunction = '';
        this.insertFunction = '';
        this.updateFunction = '';
        this.apiCallName = 'NotificationSubscriptionApi';
        this.extensions = new extensions_1.NotificationSubscription.default(this);
    }
}
exports.default = new NotificationSubscriptionApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uU3Vic2NyaXB0aW9uQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTm90aWZpY2F0aW9uU3Vic2NyaXB0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBRS9DLDZDQUFxRTtBQUNyRSxNQUFNLDJCQUE0QixTQUFRLHFCQUFrQztJQUE1RTs7UUFDYyxnQkFBVyxHQUFHLEVBQUUsQ0FBQztRQUNqQixpQkFBWSxHQUFHLEVBQUUsQ0FBQztRQUNsQixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQixnQkFBVyxHQUFHLDZCQUE2QixDQUFDO1FBQ3RELGVBQVUsR0FBRyxJQUFJLHFDQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLENBQUM7Q0FBQTtBQUNELGtCQUFlLElBQUksMkJBQTJCLEVBQUUsQ0FBQyJ9