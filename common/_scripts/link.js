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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("../package.json"));
const util_1 = require("./util");
const path_1 = require("path");
//import { promisify } from 'util'
//npm version <update_type>
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commonRoot = path_1.join(__dirname, "..");
        //await execAsync('tsc -b ' + commonRoot);
        //await execAsync(`npm pack ${commonRoot}`);
        yield util_1.execAsync(`npm uninstall @tradingpost/common`);
        yield util_1.execAsync(`npm install ${commonRoot}`);
        console.log(`The version: ${package_json_1.default.version} of common has been linked!`);
    }
    catch (ex) {
        console.error(ex);
    }
}))();
