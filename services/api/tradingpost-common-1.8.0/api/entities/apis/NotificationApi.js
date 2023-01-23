"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class NotificationApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = '';
        this.listFunction = '';
        this.insertFunction = '';
        this.updateFunction = '';
        this.apiCallName = 'NotificationApi';
        this.extensions = new extensions_1.Notification.default(this);
    }
}
exports.default = new NotificationApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTm90aWZpY2F0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBRS9DLDZDQUF5RDtBQUN6RCxNQUFNLGVBQWdCLFNBQVEscUJBQWtDO0lBQWhFOztRQUNjLGdCQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLGlCQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLGdCQUFXLEdBQUcsaUJBQWlCLENBQUM7UUFDMUMsZUFBVSxHQUFHLElBQUkseUJBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxlQUFlLEVBQUUsQ0FBQyJ9