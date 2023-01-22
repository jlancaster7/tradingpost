"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("./EntityApi");
const Security_1 = __importDefault(require("../extensions/Security"));
class SecurityApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.updateFunction = "";
        this.insertFunction = "";
        this.getFunction = "tp.api_security_get";
        this.listFunction = "tp.api_security_list";
        this.apiCallName = "SecurityApi";
        this.extensions = new Security_1.default(this);
    }
}
exports.default = new SecurityApi();
//export { ISecurityGet, ISecurityList } 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VjdXJpdHlBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZWN1cml0eUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF3QztBQUV4QyxzRUFBMkM7QUFDM0MsTUFBTSxXQUFZLFNBQVEscUJBQW9EO0lBQTlFOztRQUNjLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBQzVCLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQVcscUJBQXFCLENBQUM7UUFDNUMsaUJBQVksR0FBVyxzQkFBc0IsQ0FBQTtRQUM3QyxnQkFBVyxHQUFXLGFBQWEsQ0FBQTtRQUM3QyxlQUFVLEdBQUcsSUFBSSxrQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2pDLENBQUM7Q0FBQTtBQUVELGtCQUFlLElBQUksV0FBVyxFQUFFLENBQUM7QUFDakMseUNBQXlDIn0=