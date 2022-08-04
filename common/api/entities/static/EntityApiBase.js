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
exports.EntityApiBase = exports.apiUrl = exports.PublicError = exports.configApi = void 0;
let apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8082";
let versionCode = process.env.API_VERSION_CODE || "alpha";
const configApi = (settings) => {
    apiBaseUrl = settings.apiBaseUrl || apiBaseUrl;
    versionCode = settings.versionCode || versionCode;
};
exports.configApi = configApi;
class PublicError extends Error {
    constructor(msg, code = 400) {
        super(msg);
        this.statusCode = code;
    }
}
exports.PublicError = PublicError;
const apiUrl = (...paths) => {
    return `${apiBaseUrl}/${versionCode}` + (paths.length ? "/" + paths.join("/") : "");
};
exports.apiUrl = apiUrl;
class EntityApiBase {
    constructor() {
        this.makeUrl = (method) => (0, exports.apiUrl)(this.constructor.name, method);
    }
    static makeHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : ''
        };
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
            const resp = yield fetch(this.makeUrl("get"), {
                method: "POST",
                body: JSON.stringify({ id }),
                headers: EntityApiBase.makeHeaders()
            });
            return EntityApiBase.handleFetchResponse(resp);
        });
    }
    // async list(ids?: (string | number)[]) {
    //     const resp = await fetch(this.makeUrl("list"), {
    //         method: "POST",
    //         headers: EntityApiBase.makeHeaders(),
    //         body: ids ? JSON.stringify({ ids }) : undefined
    //     });
    //     return EntityApiBase.handleFetchResponse<TList[]>(resp);
    // }
    insert(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(this.makeUrl("insert"), {
                method: "POST",
                body: JSON.stringify(item),
                headers: EntityApiBase.makeHeaders()
            });
            return yield EntityApiBase.handleFetchResponse(resp);
        });
    }
    update(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(this.makeUrl("update"), {
                method: "POST",
                body: JSON.stringify(Object.assign(Object.assign({}, item), { id })),
                headers: EntityApiBase.makeHeaders()
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
