"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class AlertApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = '';
        this.listFunction = "public.api_alert_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Alert.default(this);
    }
}
exports.default = new AlertApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxlcnRBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBbGVydEFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUErQztBQUUvQyw2Q0FBa0Q7QUFDbEQsTUFBTSxRQUFTLFNBQVEscUJBQXVDO0lBQTlEOztRQUNjLGdCQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLGlCQUFZLEdBQUcsdUJBQXVCLENBQUM7UUFDdkMsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDOUIsZUFBVSxHQUFHLElBQUksa0JBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxRQUFRLEVBQUUsQ0FBQyJ9