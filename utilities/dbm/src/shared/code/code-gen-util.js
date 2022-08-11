"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReadOnly = exports.ensureSnake = exports.ensureCamelCase = exports.ensurePascalCase = exports.whereKeyMatches = exports.fieldNames = exports.$dataProperty = exports.dropAndMakeFunction = exports.getKey = exports.isSplitCalc = exports.dataTableName = exports.createSqlFunctionName = exports.returnSelectQuery = exports.resolveSchema = exports.getUserId = void 0;
var code_gen_config_1 = require("./code-gen-config");
var getUserId = function (entityName) {
    return entityName === "user" ? "id" : "user_id";
};
exports.getUserId = getUserId;
var resolveSchema = function (isTest) { return isTest ? code_gen_config_1.schemas.TEMP : code_gen_config_1.schemas.DEFAULT; };
exports.resolveSchema = resolveSchema;
var returnSelectQuery = function (tableAlias, settings, viewSuffix, clause) {
    var _a;
    var keyName = (_a = (0, exports.getKey)(settings)) === null || _a === void 0 ? void 0 : _a.name;
    return "return query SELECT * FROM ".concat((0, exports.resolveSchema)(settings.isTest), ".view_").concat(settings.entityName, "_").concat(viewSuffix, "(").concat(code_gen_config_1.$request, ") as ").concat(tableAlias, " ").concat(clause ? "WHERE " + clause : "");
};
exports.returnSelectQuery = returnSelectQuery;
var createSqlFunctionName = function (schema, prefix, entityName, functionName) {
    return "".concat(schema, ".").concat(prefix, "_").concat(entityName).concat((functionName ? "_".concat(functionName) : ""));
};
exports.createSqlFunctionName = createSqlFunctionName;
var dataTableName = function (settings) { return "".concat((0, exports.resolveSchema)(settings.isTest), ".").concat((settings.tableNameOverride || "".concat(code_gen_config_1.prefixes.DATA, "_").concat(settings.entityName))); };
exports.dataTableName = dataTableName;
var isSplitCalc = function (calcType) {
    return calcType === "count" || calcType === "json" || calcType === "exists";
};
exports.isSplitCalc = isSplitCalc;
var getKey = function (settings) { return settings.entityFields.find(function (f) { return f.PK; }); };
exports.getKey = getKey;
var dropAndMakeFunction = function (settings, functionName, content, fieldNames) {
    var schema = settings.isTest ? code_gen_config_1.schemas.TEMP : code_gen_config_1.schemas.DEFAULT;
    var fullFunctionName = (0, exports.createSqlFunctionName)(schema, settings.prefixOverride || code_gen_config_1.prefixes.API, settings.entityName, functionName);
    return "\n    DROP FUNCTION IF EXISTS ".concat(fullFunctionName, "(jsonb);\n  \n    CREATE OR REPLACE FUNCTION ").concat(fullFunctionName, "(\n        request jsonb)\n        RETURNS TABLE(").concat((fieldNames ? fieldNames.map(function (fn) { return settings.entityFields.find(function (f) { return f.name === fn; }); }) : settings.entityFields).filter(function (f) { return f; }).map(function (f) { return "\"".concat(f === null || f === void 0 ? void 0 : f.name, "\" ").concat(code_gen_config_1.dtExchange[(f === null || f === void 0 ? void 0 : f.dataType.toLowerCase()) || ""] || (f === null || f === void 0 ? void 0 : f.dataType)); }).join(","), ")\n        LANGUAGE 'plpgsql'\n    AS $BODY$\n    ").concat(content.declare ? "DECLARE\r\n" + Object.keys(content.declare).map(function (k) { var _a; return "".concat(k, " ").concat((_a = content.declare) === null || _a === void 0 ? void 0 : _a[k], ";"); }).join("\r\n") : "", "\n    BEGIN\n  ").concat(content.body, ";\n    END;\n    $BODY$;");
};
exports.dropAndMakeFunction = dropAndMakeFunction;
var $dataProperty = function (fieldName, dataType) { return "(".concat(code_gen_config_1.$request, "->'data'->>'").concat(fieldName, "')::").concat(dataType); };
exports.$dataProperty = $dataProperty;
var fieldNames = function (fields, includeSettings, asRequest, 
//hackyyyyy
privateToUUID) { return fields.filter(function (f) {
    return (includeSettings.key || !f.PK) && (includeSettings.virtual || !f.calcType) && (includeSettings.nullable || !f.nullable);
}).map(function (f) { return asRequest ?
    (privateToUUID && privateToUUID.find(function (n) { return n === f.name; }) ? code_gen_config_1.$userProperty : (0, exports.$dataProperty)(f.name, f.dataType))
    : f.name; }); };
exports.fieldNames = fieldNames;
var whereKeyMatches = function (tableAlias, settings) {
    var key = (0, exports.getKey)(settings);
    return key ? "".concat(tableAlias, ".\"").concat(key === null || key === void 0 ? void 0 : key.name, "\" = ").concat((0, exports.$dataProperty)((key === null || key === void 0 ? void 0 : key.name) || "", (0, code_gen_config_1.dtExchanger)(key === null || key === void 0 ? void 0 : key.dataType))) : undefined;
};
exports.whereKeyMatches = whereKeyMatches;
var ensurePascalCase = function (name) { return name.split("_").map(function (s, i) { return s[0].toUpperCase() + s.substring(1); }).join(""); };
exports.ensurePascalCase = ensurePascalCase;
var ensureCamelCase = function (name) { return name.split("_").map(function (s, i) { return i ? s[0].toUpperCase() + s.substring(1) : s[0].toLowerCase() + s.substring(1); }).join(""); };
exports.ensureCamelCase = ensureCamelCase;
var ensureSnake = function (text) {
    if (text) {
        var lastChar = text.charAt(text.length - 1);
        if (/[A-Z]/.test(lastChar)) {
            text = text.substring(0, text.length - 1) + "_" + lastChar.toLocaleLowerCase();
        }
        return text.toLowerCase().replaceAll(" ", "_");
    }
    else
        return text;
};
exports.ensureSnake = ensureSnake;
var isReadOnly = function (field) { return field.calc === "count" || field.calc === "inline" || field.readOnly; };
exports.isReadOnly = isReadOnly;
