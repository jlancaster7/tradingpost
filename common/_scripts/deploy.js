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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVwbG95LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0Esb0RBQW1EO0FBRW5ELGlDQUFtQztBQUNuQyxrQ0FBa0M7QUFFbEMsMkJBQTJCO0FBQzNCLENBQUMsR0FBUyxFQUFFO0lBQ1IsSUFBSTtRQUVBLE1BQU0sT0FBTyxHQUFHLE1BQU0sZ0NBQWdCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM1RCxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQywwREFBMEQsQ0FBQyxDQUFBO1NBQzlFO1FBRUQsTUFBTSxJQUFBLGdCQUFTLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFBLGdCQUFTLEVBQUMsZUFBZSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDMUUsTUFBTSxJQUFBLGdCQUFTLEVBQUMsYUFBYSxFQUFFO1lBQzNCLEdBQUcsRUFBRTtnQkFDRCxTQUFTLEVBQUUsT0FBTzthQUNyQjtTQUNKLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLGFBQWEsb0JBQW9CLENBQUMsQ0FBQztLQUV0RTtJQUNELE9BQU8sRUFBRSxFQUFFO1FBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNyQjtBQUNMLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQSJ9