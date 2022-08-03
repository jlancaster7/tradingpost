"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityApi = void 0;
const EntityApi_1 = require("./EntityApi");
class SecurityApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.updateFunction = "";
        this.insertFunction = "";
        this.getFunction = "tp.api_security_get";
        this.listFunction = "tp.api_security_list";
    }
}
exports.SecurityApi = SecurityApi;
exports.default = new SecurityApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VjdXJpdHlBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZWN1cml0eUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBd0M7QUFFeEMsTUFBYSxXQUFZLFNBQVEscUJBQW9EO0lBQXJGOztRQUNjLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBQzVCLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQVcscUJBQXFCLENBQUM7UUFDNUMsaUJBQVksR0FBVyxzQkFBc0IsQ0FBQTtJQUMzRCxDQUFDO0NBQUE7QUFMRCxrQ0FLQztBQUVELGtCQUFlLElBQUksV0FBVyxFQUFFLENBQUMifQ==