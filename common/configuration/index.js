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
exports.DefaultConfig = exports.Configuration = void 0;
const client_ssm_1 = require("@aws-sdk/client-ssm");
const defaultOptions = {
    authkey: {
        raw: true,
    }
};
class Configuration {
    constructor(ssmClient, environment = (process.env.CONFIGURATION_ENV || "development"), enableCache = process.env.CONFIGURATION_ENABLE_CACHE ? JSON.parse(process.env.CONFIGURATION_ENABLE_CACHE) : true) {
        this.cache = {};
        this.fromSSM = (path, options) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const fullPath = `/${this.environment}/${path}`;
            const res = (yield this.ssmClient
                .getParameter({ Name: fullPath, WithDecryption: true }));
            if (((_a = res.Parameter) === null || _a === void 0 ? void 0 : _a.Value) === undefined)
                throw new Error(`Could not find value for parameter path '${fullPath}' please make sure the path exists and the value is populated`);
            return ((options === null || options === void 0 ? void 0 : options.raw) || ((_b = defaultOptions[path]) === null || _b === void 0 ? void 0 : _b.raw)) ? res.Parameter.Value : JSON.parse(res.Parameter.Value);
        });
        //NOTE: Currently cache will only use default options. This was done to remove the need to cache based on options 
        this.fromCacheOrSSM = (path) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            if (!this.isCacheEnabled)
                console.warn("'fromCacheOrSSM' was called but cache is not enabled. You should enable cache or use 'fromSSM'");
            const cachedEntry = this.cache[path], maxDuration = (_c = defaultOptions[path]) === null || _c === void 0 ? void 0 : _c.maxCacheDuration;
            if (cachedEntry && maxDuration && (Date.now().valueOf() - cachedEntry.cachedAt) > maxDuration)
                delete this.cache[path];
            //Needed to explicitly cast. I think typescript is confused...
            return (((_d = this.cache[path]) === null || _d === void 0 ? void 0 : _d.value) || (yield this.fromSSM(path)));
        });
        console.log(process.env.CONFIGURATION_ENV);
        this.isCacheEnabled = enableCache;
        this.environment = environment;
        this.ssmClient = ssmClient;
    }
}
exports.Configuration = Configuration;
exports.DefaultConfig = new Configuration(new client_ssm_1.SSM({
    apiVersion: '2014-11-06',
    region: "us-east-1",
}));
