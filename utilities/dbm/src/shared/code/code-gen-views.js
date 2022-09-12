"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeViewDef = exports.makeViewStatement = exports.spliKeyInfo = void 0;
var code_gen_config_1 = require("./code-gen-config");
var code_gen_util_1 = require("./code-gen-util");
var spliKeyInfo = function (entityName, field, fields, priveLetter) {
    var _a, _b;
    var _c = __read(((_b = field.calc) === null || _b === void 0 ? void 0 : _b.split("|")) || [], 3), view = _c[0], key = _c[1], _d = _c[2], splitKey = _d === void 0 ? (_a = fields.find(function (f) { return f.PK; })) === null || _a === void 0 ? void 0 : _a.name : _d;
    //HACKY
    entityName = entityName || view.split("_").filter(function (v, i, a) { return i <= a.length - 2; }).join("_");
    var userIdField = (0, code_gen_util_1.getUserId)(entityName);
    //const userProperty = `(${$request}->>'user_id')::UUID`;
    var privClause = field.private && field.name !== userIdField ? " and ".concat(priveLetter || "t", ".").concat(userIdField, " = ").concat(code_gen_config_1.$userProperty) : "";
    if (privClause) {
        console.log("".concat(field.name, " vs.").concat(userIdField));
    }
    return {
        view: view,
        entityName: entityName,
        userIdField: userIdField,
        $userProperty: code_gen_config_1.$userProperty,
        key: key,
        splitKey: splitKey,
        privClause: privClause
    };
};
exports.spliKeyInfo = spliKeyInfo;
var makeViewStatement = function (entityName, tableName, view, fieldMap, _fields, isTemp) {
    var tempPrefix = (0, code_gen_util_1.resolveSchema)(isTemp);
    //
    return "SELECT ".concat(view.fieldNames.filter(function (fn) { return fieldMap[fn]; }).map(function (fn) {
        var field = fieldMap[fn];
        if (field) {
            var _a = (0, exports.spliKeyInfo)(entityName, field, _fields, ""), view_1 = _a.view, key = _a.key, privClause = _a.privClause, splitKey = _a.splitKey;
            switch (field.calcType) {
                case "count":
                    return "(SELECT count(*) FROM ".concat(tempPrefix, ".view_").concat(view_1, "(").concat(code_gen_config_1.$request, ") as t WHERE t.\"").concat(key, "\"=d.\"").concat(splitKey, "\"").concat(privClause, ") as \"").concat(fn, "\"");
                case "exists":
                    return "EXISTS(SELECT * FROM ".concat(tempPrefix, ".view_").concat(view_1, "(").concat(code_gen_config_1.$request, ") as t WHERE t.").concat(key, "=d.\"").concat(splitKey, "\"").concat(privClause, ") as \"").concat(fn, "\"");
                case "json":
                    return "(SELECT json_agg(t) FROM ".concat(tempPrefix, ".view_").concat(view_1, "(").concat(code_gen_config_1.$request, ") as t WHERE t.").concat(key, "=d.\"").concat(splitKey, "\"").concat(privClause, ") as \"").concat(fn, "\"");
                case "inline":
                    return "(".concat(field.calc, ") as \"").concat(fn, "\"");
                default:
                    if (field.private && fn !== 'user_id') {
                        console.log("WTF user_id vs ".concat(fn));
                        return "CASE WHEN d.".concat((0, code_gen_util_1.getUserId)(entityName), " = (").concat(code_gen_config_1.$request, "->>'user_id')::UUID THEN d.\"").concat(fn, "\" END as \"").concat(fn, "\"");
                    }
                    else {
                        return 'd."' + fn + '"';
                    }
            }
        }
        else
            return fn;
    }).join(", "), " FROM ").concat(tableName, " as d");
};
exports.makeViewStatement = makeViewStatement;
var makeViewDef = function (entity, views, validFields, fieldMap, isTest) {
    var viewDef = {};
    views.forEach(function (v) {
        var _a, _b;
        if (v.fieldNames.length) {
            var viewSelect = (0, exports.makeViewStatement)(entity.name, (0, code_gen_util_1.dataTableName)({
                entityFields: [],
                entityName: entity.name,
                isTest: isTest,
                tableNameOverride: ((_a = entity.definition) === null || _a === void 0 ? void 0 : _a.tableNameOverride) || "",
                prefixOverride: ""
            }), v, fieldMap, validFields, isTest);
            viewDef[v.name] = {
                fieldNames: v.fieldNames,
                definition: (0, code_gen_util_1.dropAndMakeFunction)({
                    //This is not a mistake
                    entityName: v.name,
                    tableNameOverride: ((_b = entity.definition) === null || _b === void 0 ? void 0 : _b.tableNameOverride) || "",
                    entityFields: v.fieldNames.map(function (fn) { return fieldMap[fn]; }).filter(function (f) { return f; }),
                    prefixOverride: "view",
                    isTest: isTest
                }, "", {
                    body: "RETURN QUERY ".concat(viewSelect)
                })
            };
        }
    });
    return viewDef;
};
exports.makeViewDef = makeViewDef;
