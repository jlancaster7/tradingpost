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
exports.ensureServerExtensions = exports.Extension = void 0;
const EntityApiBase_1 = require("../static/EntityApiBase");
class Extension {
    constructor(baseApi) {
        this._defaultPostRequest = (s) => ({ method: "POST", body: s !== undefined ? JSON.stringify(s) : undefined });
        this._makeFetch = (methodName, requestInit) => {
            return ((settings) => __awaiter(this, void 0, void 0, function* () {
                const resp = yield fetch(this.baseApi.makeUrl(methodName), Object.assign({ method: "POST", headers: EntityApiBase_1.EntityApiBase.makeHeaders() }, requestInit(settings)));
                return EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            }));
        };
        this._makePagedFetch = (methodName, requestInit) => {
            return ((req) => __awaiter(this, void 0, void 0, function* () {
                const resp = yield fetch(this.baseApi.makeUrl(methodName) + `?page=${req.$page}` + (req.$limit ? `&limit=${req.$limit}` : ""), Object.assign({ method: "POST", headers: EntityApiBase_1.EntityApiBase.makeHeaders() }, requestInit(req.settings)));
                return EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            }));
        };
        this.baseApi = baseApi;
    }
}
exports.Extension = Extension;
exports.default = Extension;
//TODO: type the extension other stuff
const ensureServerExtensions = (defs) => defs;
exports.ensureServerExtensions = ensureServerExtensions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyREFBdUQ7QUFHdkQsTUFBYSxTQUFTO0lBRWxCLFlBQVksT0FBMEM7UUFJNUMsd0JBQW1CLEdBQUcsQ0FBSSxDQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBZ0IsQ0FBQTtRQUM3SCxlQUFVLEdBQUcsQ0FBVyxVQUE2QixFQUFFLFdBQStGLEVBQUUsRUFBRTtZQUNoSyxPQUFPLENBQUMsQ0FBTyxRQUFXLEVBQUUsRUFBRTtnQkFDMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBb0IsQ0FBQyxrQkFBSSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSw2QkFBYSxDQUFDLFdBQVcsRUFBRSxJQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRyxDQUFDO2dCQUN6SixPQUFPLDZCQUFhLENBQUMsbUJBQW1CLENBQUksSUFBSSxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFBLENBQXVGLENBQUE7UUFDNUYsQ0FBQyxDQUFBO1FBQ1Msb0JBQWUsR0FBRyxDQUFXLFVBQTZCLEVBQUUsV0FBK0YsRUFBRSxFQUFFO1lBQ3JLLE9BQU8sQ0FBQyxDQUFPLEdBSWQsRUFBRSxFQUFFO2dCQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQW9CLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQUksTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFHLENBQUM7Z0JBQ2pPLE9BQU8sNkJBQWEsQ0FBQyxtQkFBbUIsQ0FBSSxJQUFJLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUEsQ0FPb0IsQ0FBQTtRQUN6QixDQUFDLENBQUE7UUExQkcsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztDQTBCSjtBQTlCRCw4QkE4QkM7QUFHRCxrQkFBZSxTQUFTLENBQUM7QUFtQnpCLHNDQUFzQztBQUMvQixNQUFNLHNCQUFzQixHQUFHLENBQUksSUFNekMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFBO0FBTkcsUUFBQSxzQkFBc0IsMEJBTXpCIn0=