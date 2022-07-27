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
const configuration_1 = require("../configuration");
const util_1 = require("./util");
//import { promisify } from 'util'
//npm version <update_type>
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const npm_key = yield configuration_1.AutomationConfig.fromSSM("npm_key");
        const [nodeCmd, filePath, versionUpdateType] = process.argv;
        if (!versionUpdateType) {
            throw new Error("Please provide a version update type (patch|minor|major)");
        }
        yield (0, util_1.execAsync)('tsc');
        const versionNumber = yield (0, util_1.execAsync)(`npm version ${versionUpdateType}`);
        yield (0, util_1.execAsync)('npm publish', {
            env: {
                NPM_TOKEN: npm_key
            }
        });
        console.log(`Deployed Verions ${versionNumber} of common to NPM!`);
    }
    catch (ex) {
        console.error(ex);
    }
}))();
