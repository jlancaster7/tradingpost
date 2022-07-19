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
