"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApiDef = void 0;
var code_gen_config_1 = require("./code-gen-config");
var code_gen_util_1 = require("./code-gen-util");
var makeApiDef = function (entityName, isTest, can) {
    var apiFunc = function (key) {
        return '"' + (0, code_gen_util_1.createSqlFunctionName)((0, code_gen_util_1.resolveSchema)(isTest), code_gen_config_1.prefixes.API, entityName, code_gen_config_1.functionNames[key]) + '"';
    };
    var entityPascaled = (0, code_gen_util_1.ensurePascalCase)(entityName);
    var interfaces = [can.get ? "I".concat(entityPascaled, "Get") : "never", can.list ? "I".concat(entityPascaled, "List") : "never", can.insert ? "I".concat(entityPascaled, "Insert") : 'never', can.update ? "I".concat(entityPascaled, "Update") : 'never'];
    var inOut = interfaces.filter(function (s) { return s !== "never"; }).join(",");
    return "import { EntityApi } from '../static/EntityApi'\nimport { ".concat(inOut, " } from '../interfaces'\nimport { ").concat(entityPascaled, " as Extensions } from './extensions'\nclass ").concat(entityPascaled, "Api extends EntityApi<").concat(interfaces.join(","), "> {\n    protected getFunction = ").concat(can.get ? apiFunc("GET") : "''", ";\n    protected listFunction = ").concat(can.list ? apiFunc("LIST") : "''", ";\n    protected insertFunction = ").concat(can.insert ? apiFunc("INSERT") : "''", ";\n    protected updateFunction = ").concat(can.update ? apiFunc("UPDATE") : "''", ";\n    protected apiCallName = '").concat(entityPascaled, "Api';\n    extensions = new Extensions.default(this)\n}\nexport default new ").concat(entityPascaled, "Api();\nexport type {").concat(inOut, "}\n");
};
exports.makeApiDef = makeApiDef;
