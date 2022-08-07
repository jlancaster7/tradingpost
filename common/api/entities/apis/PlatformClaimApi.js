"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class PlatformClaimApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_platform_claim_get";
        this.listFunction = "public.api_platform_claim_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.PlatformClaim.default(this);
    }
}
exports.default = new PlatformClaimApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1DbGFpbUFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBsYXRmb3JtQ2xhaW1BcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFFL0MsNkNBQTBEO0FBQzFELE1BQU0sZ0JBQWlCLFNBQVEscUJBQTJEO0lBQTFGOztRQUNjLGdCQUFXLEdBQUcsK0JBQStCLENBQUM7UUFDOUMsaUJBQVksR0FBRyxnQ0FBZ0MsQ0FBQztRQUNoRCxtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUM5QixlQUFVLEdBQUcsSUFBSSwwQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0NBQUE7QUFDRCxrQkFBZSxJQUFJLGdCQUFnQixFQUFFLENBQUMifQ==