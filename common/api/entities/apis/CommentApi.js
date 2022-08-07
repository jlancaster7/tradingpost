"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class CommentApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_comment_get";
        this.listFunction = "public.api_comment_list";
        this.insertFunction = '';
        this.updateFunction = '';
        this.extensions = new extensions_1.Comment.default(this);
    }
}
exports.default = new CommentApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWVudEFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbW1lbnRBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFFL0MsNkNBQW9EO0FBQ3BELE1BQU0sVUFBVyxTQUFRLHFCQUErQztJQUF4RTs7UUFDYyxnQkFBVyxHQUFHLHdCQUF3QixDQUFDO1FBQ3ZDLGlCQUFZLEdBQUcseUJBQXlCLENBQUM7UUFDekMsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDOUIsZUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQyJ9