"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class BrokerageApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = '';
        this.listFunction = '';
        this.insertFunction = '';
        this.updateFunction = '';
        this.apiCallName = 'BrokerageApi';
        this.extensions = new extensions_1.Brokerage.default(this);
    }
}
exports.default = new BrokerageApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJva2VyYWdlQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQnJva2VyYWdlQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBRS9DLDZDQUFzRDtBQUN0RCxNQUFNLFlBQWEsU0FBUSxxQkFBa0M7SUFBN0Q7O1FBQ2MsZ0JBQVcsR0FBRyxFQUFFLENBQUM7UUFDakIsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFDbEIsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsZ0JBQVcsR0FBRyxjQUFjLENBQUM7UUFDdkMsZUFBVSxHQUFHLElBQUksc0JBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxZQUFZLEVBQUUsQ0FBQyJ9