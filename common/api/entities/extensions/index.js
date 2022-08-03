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
        this._makeFetch = (methodName, requestInit) => {
            return (settings) => __awaiter(this, void 0, void 0, function* () {
                const resp = yield fetch(this.baseApi.makeUrl(methodName), Object.assign({ method: "POST", headers: EntityApiBase_1.EntityApiBase.makeHeaders() }, requestInit(settings)));
                return EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            });
        };
        this.baseApi = baseApi;
    }
}
exports.Extension = Extension;
exports.default = Extension;
//should be bound in the future
const ensureServerExtensions = (defs) => defs;
exports.ensureServerExtensions = ensureServerExtensions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyREFBdUQ7QUFFdkQsTUFBYSxTQUFTO0lBR2xCLFlBQVksT0FBMEM7UUFHNUMsZUFBVSxHQUFHLENBQWEsVUFBNkIsRUFBRSxXQUF5QyxFQUFFLEVBQUU7WUFDNUcsT0FBTyxDQUFPLFFBQVcsRUFBRSxFQUFFO2dCQUN6QixNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFvQixDQUFDLGtCQUFJLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLDZCQUFhLENBQUMsV0FBVyxFQUFFLElBQUssV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFHLENBQUM7Z0JBQ3pKLE9BQU8sNkJBQWEsQ0FBQyxtQkFBbUIsQ0FBSSxJQUFJLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUEsQ0FBQTtRQUNMLENBQUMsQ0FBQTtRQVBHLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7Q0FPSjtBQVpELDhCQVlDO0FBQ0Qsa0JBQWUsU0FBUyxDQUFDO0FBQ3pCLCtCQUErQjtBQUN4QixNQUFNLHNCQUFzQixHQUFHLENBQUksSUFJdkIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFBO0FBSmYsUUFBQSxzQkFBc0IsMEJBSVAifQ==