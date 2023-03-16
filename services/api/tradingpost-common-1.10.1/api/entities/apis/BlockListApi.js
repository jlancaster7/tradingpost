"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class BlockListApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = "public.api_block_list_get";
        this.listFunction = "public.api_block_list_list";
        this.insertFunction = "public.api_block_list_insert";
        this.updateFunction = '';
        this.apiCallName = 'BlockListApi';
        this.extensions = new extensions_1.BlockList.default(this);
    }
}
exports.default = new BlockListApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxvY2tMaXN0QXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQmxvY2tMaXN0QXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBRS9DLDZDQUFzRDtBQUN0RCxNQUFNLFlBQWEsU0FBUSxxQkFBOEQ7SUFBekY7O1FBQ2MsZ0JBQVcsR0FBRywyQkFBMkIsQ0FBQztRQUMxQyxpQkFBWSxHQUFHLDRCQUE0QixDQUFDO1FBQzVDLG1CQUFjLEdBQUcsOEJBQThCLENBQUM7UUFDaEQsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIsZ0JBQVcsR0FBRyxjQUFjLENBQUM7UUFDdkMsZUFBVSxHQUFHLElBQUksc0JBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0MsQ0FBQztDQUFBO0FBQ0Qsa0JBQWUsSUFBSSxZQUFZLEVBQUUsQ0FBQyJ9