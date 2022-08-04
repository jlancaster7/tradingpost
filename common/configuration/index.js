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
exports.AutomationConfig = exports.DefaultConfig = exports.Configuration = void 0;
const client_ssm_1 = require("@aws-sdk/client-ssm");
const defaultOptions = {
    authkey: {
        raw: true,
    }
};
class Configuration {
    constructor(ssmClient, defaultOptions, environment = (process.env.CONFIGURATION_ENV || "development"), enableCache = process.env.CONFIGURATION_ENABLE_CACHE ? JSON.parse(process.env.CONFIGURATION_ENABLE_CACHE) : true) {
        this.cache = {};
        this.fromSSM = (path, options) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const fullPath = `/${this.environment}/${path}`;
            const res = (yield this.ssmClient
                .getParameter({ Name: fullPath, WithDecryption: true }));
            if (((_a = res.Parameter) === null || _a === void 0 ? void 0 : _a.Value) === undefined)
                throw new Error(`Could not find value for parameter path '${fullPath}' please make sure the path exists and the value is populated`);
            return ((options === null || options === void 0 ? void 0 : options.raw) || ((_b = this.defaultOptions[path]) === null || _b === void 0 ? void 0 : _b.raw)) ? res.Parameter.Value : JSON.parse(res.Parameter.Value);
        });
        //NOTE: Currently cache will only use default options. This was done to remove the need to cache based on options 
        this.fromCacheOrSSM = (path) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            if (!this.isCacheEnabled)
                console.warn("'fromCacheOrSSM' was called but cache is not enabled. You should enable cache or use 'fromSSM'");
            const cachedEntry = this.cache[path], maxDuration = (_c = this.defaultOptions[path]) === null || _c === void 0 ? void 0 : _c.maxCacheDuration;
            if (cachedEntry && maxDuration && (Date.now().valueOf() - cachedEntry.cachedAt) > maxDuration)
                delete this.cache[path];
            //Needed to explicitly cast. I think typescript is confused...
            return (((_d = this.cache[path]) === null || _d === void 0 ? void 0 : _d.value) || (yield this.fromSSM(path)));
        });
        this.defaultOptions = defaultOptions || {};
        this.isCacheEnabled = enableCache;
        this.environment = environment;
        this.ssmClient = ssmClient;
    }
}
exports.Configuration = Configuration;
const BASE_REGION = "us-east-1";
const API_VERSION = '2014-11-06';
exports.DefaultConfig = new Configuration(new client_ssm_1.SSM({
    apiVersion: API_VERSION,
    region: BASE_REGION,
}), { authkey: { raw: true } });
exports.AutomationConfig = new Configuration(new client_ssm_1.SSM({
    apiVersion: API_VERSION,
    region: BASE_REGION,
}), { npm_key: { raw: true } }, "automation");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxvREFBd0M7QUFvRnhDLE1BQU0sY0FBYyxHQUErQztJQUMvRCxPQUFPLEVBQUU7UUFDTCxHQUFHLEVBQUUsSUFBSTtLQUNaO0NBQ0osQ0FBQTtBQVNELE1BQWEsYUFBYTtJQU90QixZQUNJLFNBQWMsRUFDZCxjQUFtRCxFQUNuRCxjQUFnQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQXFDLElBQUksYUFBYSxDQUFDLEVBQ3BHLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQVA1RyxVQUFLLEdBQWlCLEVBQUUsQ0FBQTtRQWdCaEMsWUFBTyxHQUFHLENBQTBCLElBQU8sRUFBRSxPQUF1QixFQUFpQixFQUFFOztZQUNuRixNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBYyxFQUFFLENBQUE7WUFDekQsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTO2lCQUM1QixZQUFZLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFBLE1BQUEsR0FBRyxDQUFDLFNBQVMsMENBQUUsS0FBSyxNQUFLLFNBQVM7Z0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLFFBQVEsK0RBQStELENBQUMsQ0FBQztZQUV6SSxPQUFPLENBQUMsQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsR0FBRyxNQUFJLE1BQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsMENBQUUsR0FBRyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwSCxDQUFDLENBQUEsQ0FBQTtRQUVELGtIQUFrSDtRQUNsSCxtQkFBYyxHQUFHLENBQTBCLElBQU8sRUFBaUIsRUFBRTs7WUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjO2dCQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLGdHQUFnRyxDQUFDLENBQUE7WUFFbEgsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFDaEMsV0FBVyxHQUFHLE1BQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsMENBQUUsZ0JBQWdCLENBQUE7WUFFN0QsSUFBSSxXQUFXLElBQUksV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxXQUFXO2dCQUN6RixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFNUIsOERBQThEO1lBQzlELE9BQU8sQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsMENBQUUsS0FBSyxNQUFJLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFTLENBQUE7UUFDeEUsQ0FBQyxDQUFBLENBQUE7UUE3QkcsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLElBQUksRUFBRSxDQUFBO1FBQzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsV0FBVyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQy9CLENBQUM7Q0EwQko7QUE1Q0Qsc0NBNENDO0FBRUQsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQ2hDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQztBQUVwQixRQUFBLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBYyxJQUFJLGdCQUFHLENBQUM7SUFDaEUsVUFBVSxFQUFFLFdBQVc7SUFDdkIsTUFBTSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxFQUFDLENBQUMsQ0FBQztBQUdmLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSxhQUFhLENBQXNCLElBQUksZ0JBQUcsQ0FBQztJQUMzRSxVQUFVLEVBQUUsV0FBVztJQUN2QixNQUFNLEVBQUUsV0FBVztDQUN0QixDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLEVBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyJ9