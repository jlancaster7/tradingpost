"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class User extends index_1.Extension {
    constructor() {
        super(...arguments);
        this.uploadProfilePic = this._makeFetch("uploadProfilePic", (s) => ({
            method: "POST",
            body: JSON.stringify(s)
        }));
        this.generateBrokerageLink = this._makeFetch("generateBrokerageLink", (s) => ({
            method: "POST"
        }));
    }
}
exports.default = User;
