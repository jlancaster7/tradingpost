"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthApi = void 0;
const EntityApiBase_1 = require("./EntityApiBase");
class AuthApi {
    createLogin(email, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)(this.constructor.name, "create"), {
                method: "POST",
                body: JSON.stringify({
                    email,
                    pass,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
        });
    }
    loginWithToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.login("", token);
        });
    }
    login(email, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)(this.constructor.name, "login"), {
                method: "POST",
                body: JSON.stringify({
                    email,
                    pass,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
        });
    }
}
exports.AuthApi = AuthApi;
exports.default = new AuthApi();
