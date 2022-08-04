"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityApi = void 0;
const EntityApi_1 = require("./EntityApi");
const Security_1 = __importDefault(require("../extensions/Security"));
class SecurityApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.updateFunction = "";
        this.insertFunction = "";
        this.getFunction = "tp.api_security_get";
        this.listFunction = "tp.api_security_list";
        this.extensions = new Security_1.default(this);
    }
}
exports.SecurityApi = SecurityApi;
exports.default = new SecurityApi();
