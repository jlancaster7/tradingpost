"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class UpvoteApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_upvote_get";
        this.listFunction = "public.api_upvote_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Upvote.default(this);
    }
}
exports.default = new UpvoteApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXB2b3RlQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVXB2b3RlQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBRS9DLDZDQUFtRDtBQUNuRCxNQUFNLFNBQVUsU0FBUSxxQkFBNkM7SUFBckU7O1FBQ2MsZ0JBQVcsR0FBRyx1QkFBdUIsQ0FBQztRQUN0QyxpQkFBWSxHQUFHLHdCQUF3QixDQUFDO1FBQ3hDLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQzlCLGVBQVUsR0FBRyxJQUFJLG1CQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLENBQUM7Q0FBQTtBQUNELGtCQUFlLElBQUksU0FBUyxFQUFFLENBQUMifQ==