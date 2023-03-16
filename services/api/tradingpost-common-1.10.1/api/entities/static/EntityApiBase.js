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
const versionParts = package_json_1.version.split(".");
exports.versionCode = process.env.API_VERSION_CODE ||
    versionParts[0] + '.' + versionParts[1] ||
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5QXBpQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkVudGl0eUFwaUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQStDO0FBRS9DLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFDO0FBRXJFLE1BQU0sWUFBWSxHQUFHLHNCQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzVCLFFBQUEsV0FBVyxHQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtJQUM1QixZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDdkMsT0FBTyxDQUFBO0FBRVgsSUFBSSxXQUFXLEdBQUcsOEJBQThCLENBQUE7QUFFekMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxRQUE2RSxFQUFFLEVBQUU7SUFDdkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFM0QsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDO0lBQy9DLG1CQUFXLEdBQUcsUUFBUSxDQUFDLFdBQVcsSUFBSSxtQkFBVyxDQUFDO0lBQ2xELFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQTtBQUNyRCxDQUFDLENBQUE7QUFOWSxRQUFBLFNBQVMsYUFNckI7QUFFTSxNQUFNLGNBQWMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7QUFBbkMsUUFBQSxjQUFjLGtCQUFxQjtBQUloRCxNQUFhLFdBQVksU0FBUSxLQUFLO0lBR2xDLFlBQVksR0FBcUIsRUFBRSxJQUFJLEdBQUcsR0FBRztRQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUks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