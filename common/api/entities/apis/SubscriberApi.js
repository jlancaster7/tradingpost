"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class SubscriberApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_subscriber_get";
        this.listFunction = "public.api_subscriber_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Subscriber.default(this);
    }
}
exports.default = new SubscriberApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaWJlckFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlN1YnNjcmliZXJBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFFL0MsNkNBQXVEO0FBQ3ZELE1BQU0sYUFBYyxTQUFRLHFCQUFxRDtJQUFqRjs7UUFDYyxnQkFBVyxHQUFHLDJCQUEyQixDQUFDO1FBQzFDLGlCQUFZLEdBQUcsNEJBQTRCLENBQUM7UUFDNUMsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDOUIsZUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxhQUFhLEVBQUUsQ0FBQyJ9