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
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const lr = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            EntityApiBase_1.EntityApiBase.token = lr.token;
            return lr;
        });
    }
    createUser(first_name, last_name, handle) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)(this.constructor.name, "init"), {
                method: "POST",
                body: JSON.stringify({
                    first_name,
                    last_name,
                    handle
                }),
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const user = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            EntityApiBase_1.EntityApiBase.token = user.token;
            return user;
        });
    }
    signOut() {
        EntityApiBase_1.EntityApiBase.token = "";
    }
    loginWithToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.login("", token);
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
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const result = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            //console.log("MY TOKEN IS BEING SET AS" + result.token);
            EntityApiBase_1.EntityApiBase.token = result.token;
            return result;
        });
    }
}
exports.AuthApi = AuthApi;
exports.default = new AuthApi();
