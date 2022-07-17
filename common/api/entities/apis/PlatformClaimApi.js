"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
class PlatformClaimApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_platform_claim_get";
        this.listFunction = "public.api_platform_claim_list";
        this.insertFunction = '';
        this.updateFunction = '';
        /*extensions*/
    }
}
exports.default = new PlatformClaimApi();
