"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class PostApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_post_get";
        this.listFunction = "public.api_post_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.apiCallName = 'PostApi';
        this.extensions = new extensions_1.Post.default(this);
    }
}
exports.default = new PostApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdEFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBvc3RBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFFL0MsNkNBQWlEO0FBQ2pELE1BQU0sT0FBUSxTQUFRLHFCQUF5QztJQUEvRDs7UUFDYyxnQkFBVyxHQUFHLHFCQUFxQixDQUFDO1FBQ3BDLGlCQUFZLEdBQUcsc0JBQXNCLENBQUM7UUFDdEMsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsZ0JBQVcsR0FBRyxTQUFTLENBQUM7UUFDbEMsZUFBVSxHQUFHLElBQUksaUJBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxPQUFPLEVBQUUsQ0FBQyJ9