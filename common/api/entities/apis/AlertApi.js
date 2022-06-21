"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
class AlertApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_alert_get";
        this.listFunction = "public.api_alert_list";
        this.insertFunction = "public.api_alert_insert";
        this.updateFunction = "public.api_alert_update";
        /*extensions*/
    }
}
exports.default = new AlertApi();
