"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
class SubscriberApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_subscriber_get";
        this.listFunction = "public.api_subscriber_list";
        this.insertFunction = "public.api_subscriber_insert";
        this.updateFunction = "public.api_subscriber_update";
        /*extensions*/
    }
}
exports.default = new SubscriberApi();
