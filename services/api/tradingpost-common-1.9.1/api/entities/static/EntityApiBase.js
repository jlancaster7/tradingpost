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
exports.EntityApiBase = exports.apiUrl = exports.PublicError = exports.getCallBackUrl = exports.configApi = exports.versionCode = void 0;
const package_json_1 = require("../../../package.json");
let apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8082";
exports.versionCode = process.env.API_VERSION_CODE ||
    package_json_1.version ||
    "alpha";
let callbackUrl = "https://m.tradingpostapp.com";
const configApi = (settings) => {
    console.log("Setting api to :" + JSON.stringify(settings));
    apiBaseUrl = settings.apiBaseUrl || apiBaseUrl;
    exports.versionCode = settings.versionCode || exports.versionCode;
    callbackUrl = settings.callbackUrl || callbackUrl;
};
exports.configApi = configApi;
const getCallBackUrl = () => callbackUrl;
exports.getCallBackUrl = getCallBackUrl;
class PublicError extends Error {
    constructor(msg, code = 400) {
        super(msg);
        this.statusCode = code;
    }
}
exports.PublicError = PublicError;
const apiUrl = (...paths) => {
    return `${apiBaseUrl}/${exports.versionCode}` + (paths.length ? "/" + paths.join("/") : "");
};
exports.apiUrl = apiUrl;
class EntityApiBase {
    constructor() {
        this.makeUrl = (method) => (0, exports.apiUrl)(this.apiCallName, method);
    }
    static makeHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : undefined
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
    validate(isInsert) {
        return null;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5QXBpQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkVudGl0eUFwaUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQTZDO0FBRTdDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFDO0FBRTFELFFBQUEsV0FBVyxHQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtJQUM1QixzQkFBTztJQUNQLE9BQU8sQ0FBQTtBQUVYLElBQUksV0FBVyxHQUFHLDhCQUE4QixDQUFBO0FBRXpDLE1BQU0sU0FBUyxHQUFHLENBQUMsUUFBNkUsRUFBRSxFQUFFO0lBQ3ZHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRTNELFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQztJQUMvQyxtQkFBVyxHQUFHLFFBQVEsQ0FBQyxXQUFXLElBQUksbUJBQVcsQ0FBQztJQUNsRCxXQUFXLEdBQUcsUUFBUSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUE7QUFDckQsQ0FBQyxDQUFBO0FBTlksUUFBQSxTQUFTLGFBTXJCO0FBRU0sTUFBTSxjQUFjLEdBQUcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQW5DLFFBQUEsY0FBYyxrQkFBcUI7QUFJaEQsTUFBYSxXQUFZLFNBQVEsS0FBSztJQUdsQyxZQUFZLEdBQXFCLEVBQUUsSUFBSSxHQUFHLEdBQUc7UUFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztDQUNKO0FBUEQsa0NBT0M7QUFFTSxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsS0FBc0MsRUFBRSxFQUFFO0lBQ2hFLE9BQU8sR0FBRyxVQUFVLElBQUksbUJB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