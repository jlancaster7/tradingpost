"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
class PlatformClaimApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_platform_claim_get";
        this.listFunction = "public.api_platform_claim_list";
        this.insertFunction = "public.api_platform_claim_insert";
        this.updateFunction = "public.api_platform_claim_update";
        /*extensions*/
    }
}
exports.default = new PlatformClaimApi();
