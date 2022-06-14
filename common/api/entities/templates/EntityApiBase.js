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
exports.EntityApiBase = exports.apiUrl = void 0;
const apiBaseUrl = "http://10.0.0.94:8082";
const apiUrl = (...paths) => {
    return `${apiBaseUrl}/alpha` + (paths.length ? "/" + paths.join("/") : "");
};
exports.apiUrl = apiUrl;
class EntityApiBase {
    constructor() {
        this.makeUrl = (id) => (0, exports.apiUrl)(...(id === undefined ? [this.constructor.name] : [this.constructor.name, id]));
    }
    static handleFetchResponse(resp) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_a = resp.headers.get('Content-Type')) === null || _a === void 0 ? void 0 : _a.split(';')[0]) !== 'application/json')
                throw new Error(`Unsupported Content-Type from Response ${resp.headers.get('Content-Type')}`);
            const data = yield resp.json();
            if (resp.ok)
                return data;
            else
                throw data;
        });
    }
    //`${this.constructor.name}${(id !== undefined ? "/" + id : "")}`
    //assumes fetch exists globally
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(this.makeUrl(id), {
                method: "GET"
            });
            return EntityApiBase.handleFetchResponse(resp);
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(this.makeUrl(), {
                method: "GET"
            });
            return EntityApiBase.handleFetchResponse(resp);
        });
    }
    insert(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(this.makeUrl(), {
                method: "POST",
                body: JSON.stringify(item),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return yield EntityApiBase.handleFetchResponse(resp);
        });
    }
    update(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(this.makeUrl(id), {
                method: "POST",
                body: JSON.stringify(item),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return EntityApiBase.handleFetchResponse(resp);
        });
    }
    validate(isInsert) { return null; }
    ;
}
exports.EntityApiBase = EntityApiBase;
// class Test extends EntityApi<any, any, any, any>{
//     updateFunction = "update";
//     insertFunction = "insert"
//     getFunction = "get"
//     listFunction = "list"
//     /***extensions***/
// }
