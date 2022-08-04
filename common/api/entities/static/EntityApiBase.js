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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5QXBpQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkVudGl0eUFwaUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksdUJBQXVCLENBQUM7QUFDckUsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUE7QUFHbEQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxRQUF1RCxFQUFFLEVBQUU7SUFDakYsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDO0lBQy9DLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQztBQUN0RCxDQUFDLENBQUE7QUFIWSxRQUFBLFNBQVMsYUFHckI7QUFJRCxNQUFhLFdBQVksU0FBUSxLQUFLO0lBRWxDLFlBQVksR0FBcUIsRUFBRSxJQUFJLEdBQUcsR0FBRztRQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUFORCxrQ0FNQztBQUVNLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxLQUFzQyxFQUFFLEVBQUU7SUFDaEUsT0FBTyxHQUFHLFVBQVUsSUFBSSxXQUFXLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4RixDQUFDLENBQUE7QUFGWSxRQUFBLE1BQU0sVUFFbEI7QUFFRCxNQUFzQixhQUFhO0lBQW5DO1FBMkJJLFlBQU8sR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsSUFBQSxjQUFNLEVBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJ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