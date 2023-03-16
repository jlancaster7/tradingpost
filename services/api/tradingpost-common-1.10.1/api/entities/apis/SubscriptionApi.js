"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class SubscriptionApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_subscription_get";
        this.listFunction = "public.api_subscription_list";
        this.insertFunction = "public.api_subscription_insert";
        this.updateFunction = "public.api_subscription_update";
        this.apiCallName = 'SubscriptionApi';
        this.extensions = new extensions_1.Subscription.default(this);
    }
}
exports.default = new SubscriptionApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaXB0aW9uQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU3Vic2NyaXB0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBRS9DLDZDQUF5RDtBQUN6RCxNQUFNLGVBQWdCLFNBQVEscUJBQXFGO0lBQW5IOztRQUNjLGdCQUFXLEdBQUcsNkJBQTZCLENBQUM7UUFDNUMsaUJBQVksR0FBRyw4QkFBOEIsQ0FBQztRQUM5QyxtQkFBYyxHQUFHLGdDQUFnQyxDQUFDO1FBQ2xELG1CQUFjLEdBQUcsZ0NBQWdDLENBQUM7UUFDbEQsZ0JBQVcsR0FBRyxpQkFBaUIsQ0FBQztRQUMxQyxlQUFVLEdBQUcsSUFBSSx5QkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0NBQUE7QUFDRCxrQkFBZSxJQUFJLGVBQWUsRUFBRSxDQUFDIn0=