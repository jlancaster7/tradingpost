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
            var _a, _b, _c;
            let output;
            if (path in process.env) {
                const val = process.env[path];
                return ((options === null || options === void 0 ? void 0 : options.raw) || ((_a = this.defaultOptions[path]) === null || _a === void 0 ? void 0 : _a.raw)) ? val : JSON.parse(val);
            }
            const fullPath = `/${this.environment}/${path}`;
            if (process.env[path]) {
                console.log(`${fullPath} as been loaded from the local environment`);
                output = process.env[path];
            }
            else
                output = (_b = (yield this.ssmClient.getParameter({ Name: fullPath, WithDecryption: true })).Parameter) === null || _b === void 0 ? void 0 : _b.Value;
            if (output === undefined)
                throw new Error(`Could not find value for parameter path '${fullPath}' please make sure the path exists and the value is populated`);
            return ((options === null || options === void 0 ? void 0 : options.raw) || ((_c = this.defaultOptions[path]) === null || _c === void 0 ? void 0 : _c.raw)) ? output : JSON.parse(output);
        });
        //NOTE: Currently cache will only use default options. This was done to remove the need to cache based on options 
        this.fromCacheOrSSM = (path) => __awaiter(this, void 0, void 0, function* () {
            var _d, _e;
            if (!this.isCacheEnabled)
                console.warn("'fromCacheOrSSM' was called but cache is not enabled. You should enable cache or use 'fromSSM'");
            const cachedEntry = this.cache[path], maxDuration = (_d = this.defaultOptions[path]) === null || _d === void 0 ? void 0 : _d.maxCacheDuration;
            if (cachedEntry && maxDuration && (Date.now().valueOf() - cachedEntry.cachedAt) > maxDuration)
                delete this.cache[path];
            //Needed to explicitly cast. I think typescript is confused...
            return (((_e = this.cache[path]) === null || _e === void 0 ? void 0 : _e.value) || (yield this.fromSSM(path)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxvREFBd0M7QUFxR3hDLE1BQU0sY0FBYyxHQUErQztJQUMvRCxPQUFPLEVBQUU7UUFDTCxHQUFHLEVBQUUsSUFBSTtLQUNaO0NBQ0osQ0FBQTtBQVNELE1BQWEsYUFBYTtJQU90QixZQUNJLFNBQWMsRUFDZCxjQUFtRCxFQUNuRCxjQUFnQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQXFDLElBQUksYUFBYSxDQUFDLEVBQ3BHLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQVA1RyxVQUFLLEdBQWlCLEVBQUUsQ0FBQTtRQWdCaEMsWUFBTyxHQUFHLENBQTBCLElBQU8sRUFBRSxPQUF1QixFQUFpQixFQUFFOztZQUNuRixJQUFJLE1BQTBCLENBQUM7WUFFL0IsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDckIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQVcsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLEdBQUcsTUFBSSxNQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLDBDQUFFLEdBQUcsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNuRjtZQUdELE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFjLEVBQUUsQ0FBQTtZQUN6RCxJQUFLLE9BQU8sQ0FBQyxHQUFX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