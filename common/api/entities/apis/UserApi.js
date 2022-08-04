"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class UserApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_user_get";
        this.listFunction = "public.api_user_list";
        this.insertFunction = '';
        this.updateFunction = "public.api_user_update";
        this.extensions = new extensions_1.User.default(this);
    }
}
exports.default = new UserApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlckFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVzZXJBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFFL0MsNkNBQWlEO0FBQ2pELE1BQU0sT0FBUSxTQUFRLHFCQUErQztJQUFyRTs7UUFDYyxnQkFBVyxHQUFHLHFCQUFxQixDQUFDO1FBQ3BDLGlCQUFZLEdBQUcsc0JBQXNCLENBQUM7UUFDdEMsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsbUJBQWMsR0FBRyx3QkFBd0IsQ0FBQztRQUNwRCxlQUFVLEdBQUcsSUFBSSxpQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0NBQUE7QUFDRCxrQkFBZSxJQUFJLE9BQU8sRUFBRSxDQUFDIn0=