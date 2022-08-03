"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class AlertApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_alert_get";
        this.listFunction = "public.api_alert_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Alert.default(this);
    }
}
exports.default = new AlertApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxlcnRBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBbGVydEFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUErQztBQUUvQyw2Q0FBa0Q7QUFDbEQsTUFBTSxRQUFTLFNBQVEscUJBQTJDO0lBQWxFOztRQUNjLGdCQUFXLEdBQUcsc0JBQXNCLENBQUM7UUFDckMsaUJBQVksR0FBRyx1QkFBdUIsQ0FBQztRQUN2QyxtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUM5QixlQUFVLEdBQUcsSUFBSSxrQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0NBQUE7QUFDRCxrQkFBZSxJQUFJLFFBQVEsRUFBRSxDQUFDIn0=