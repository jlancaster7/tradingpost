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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFunctionDef = exports.makeListFunction = exports.makeGetFunction = exports.makeUpdateFunction = exports.makeInsertFunction = void 0;
var code_gen_config_1 = require("./code-gen-config");
var code_gen_util_1 = require("./code-gen-util");
var code_gen_views_1 = require("./code-gen-views");
var dataFieldFilter = {
    key: false,
    nullable: true,
    virtual: false
};
var makeInsertFunction = function (settings, fields, other) {
    var _a, _b, _c, _d;
    var key = (0, code_gen_util_1.getKey)(settings);
    var validFields = settings.entityFields.filter(function (f) { return fields.find(function (fn) { return fn === f.name; }); });
    return (key === null || key === void 0 ? void 0 : key.dataType) ? (0, code_gen_util_1.dropAndMakeFunction)(settings, code_gen_config_1.functionNames.INSERT, {
        declare: {
            _idField: code_gen_config_1.dtExchange[key.dataType.toLowerCase() || ""] || key.dataType
        },
        body: __spreadArray(__spreadArray([
            "INSERT INTO ".concat((0, code_gen_util_1.dataTableName)(settings), "(\n  ").concat((0, code_gen_util_1.fieldNames)(validFields, dataFieldFilter).join(",\r\n"), ")"),
            "VALUES (".concat((0, code_gen_util_1.fieldNames)(validFields, dataFieldFilter, true, validFields.filter(function (f) { return f.private || f.name === "user_id"; }).map(function (f) { return f.name; })).join(",\r\n"), ")"),
            "returning ".concat((0, code_gen_util_1.dataTableName)(settings), ".").concat(key === null || key === void 0 ? void 0 : key.name, " INTO _idField;")
        ], __read(makeCalcParts(settings, fields, other, true)), false), [
            (0, code_gen_util_1.returnSelectQuery)("v", settings, "get", "v.".concat(key === null || key === void 0 ? void 0 : key.name, " = _idField"))
        ], false).join("\r\n")
    }, (_d = (_c = (_b = (_a = other.allEntities.find(function (e) { return e.name === settings.entityName; })) === null || _a === void 0 ? void 0 : _a.definition) === null || _b === void 0 ? void 0 : _b.views) === null || _c === void 0 ? void 0 : _c.find(function (v) { return v.name === "".concat(settings.entityName, "_get"); })) === null || _d === void 0 ? void 0 : _d.fieldNames) : "";
};
exports.makeInsertFunction = makeInsertFunction;
var makeCalcParts = function (settings, fields, other, isInsert) {
    return settings.entityFields.filter(function (f) {
        return fields.find(function (fn) { return fn === f.name; }) &&
            (f.calcType === "exists" || f.calcType === "json" || f.calcType === "count") &&
            !f.readOnly;
    }).flatMap(function (f) {
        var _a, _b, _c, _d;
        //Need to add a "write" view 
        var _e = (0, code_gen_views_1.spliKeyInfo)("", f, settings.entityFields), view = _e.view, key = _e.key, privClause = _e.privClause, splitKey = _e.splitKey, entityName = _e.entityName, userIdField = _e.userIdField;
        var allEntities = other.allEntities;
        var relatedTable = "".concat((0, code_gen_util_1.resolveSchema)(settings.isTest), ".").concat(code_gen_config_1.prefixes.DATA, "_").concat(entityName);
        var selectedFields = [];
        var selectedView;
        for (var index = 0; index < allEntities.length; index++) {
            var entity = allEntities[index];
            (_b = (_a = entity.definition) === null || _a === void 0 ? void 0 : _a.views) === null || _b === void 0 ? void 0 : _b.forEach(function (v) {
                if (v.name === view) {
                    selectedView = v;
                }
            });
            if (selectedView && ((_c = entity.definition) === null || _c === void 0 ? void 0 : _c.fields)) {
                //Hack: Ignore matched id 
                selectedFields = (_d = entity.definition) === null || _d === void 0 ? void 0 : _d.fields.filter(function (_f) {
                    return (selectedView === null || selectedView === void 0 ? void 0 : selectedView.fieldNames.find(function (fn) { return fn === _f.name; })) && !_f.PK && _f.name !== key;
                });
                break;
            }
        }
        var pk = settings.entityFields.find(function (f) { return f.PK; });
        var idField = isInsert ? "_idField" : (0, code_gen_util_1.$dataProperty)((pk === null || pk === void 0 ? void 0 : pk.name) || "", (0, code_gen_config_1.dtExchanger)(pk === null || pk === void 0 ? void 0 : pk.dataType));
        //... transform users fields 
        var insertFields = __spreadArray([
            key
        ], __read(selectedFields.map(function (f) { return f.name; })), false).join(",");
        var valueFields = __spreadArray([
            idField
        ], __read(selectedFields.map(function (f) {
            return f.name.toLowerCase() === userIdField.toLowerCase() ? code_gen_config_1.$userProperty : "(value->>'".concat(f.name, "')::").concat(f.dataType); //$dataProperty(f.name, f.dataType)
        })), false).join(",");
        return [
            "DELETE FROM ".concat(relatedTable, " t WHERE t.").concat(key, " = ").concat(idField, ";"),
            "IF request->'data' ? '".concat(f.name, "' THEN\r\nINSERT INTO ").concat(relatedTable, "(").concat(insertFields, ")"),
            "SELECT ".concat(valueFields, " FROM json_array_elements(").concat((0, code_gen_util_1.$dataProperty)(f.name, f.dataType), ");"),
            'END IF;'
        ];
    });
};
var makeUpdateFunction = function (settings, fields, other) {
    var _a, _b, _c, _d;
    var condition = (0, code_gen_util_1.whereKeyMatches)("v", settings);
    return condition ? (0, code_gen_util_1.dropAndMakeFunction)(settings, code_gen_config_1.functionNames.UPDATE, {
        body: __spreadArray(__spreadArray([
            "UPDATE ".concat((0, code_gen_util_1.dataTableName)(settings), " v SET ").concat((0, code_gen_util_1.fieldNames)(settings.entityFields.filter(function (f) { return fields.find(function (fn) { return fn === f.name; }); }), dataFieldFilter)
                .map(function (f) { var _a; return ((_a = settings.entityFields.find(function (_f) { return _f.name === f; })) === null || _a === void 0 ? void 0 : _a.private) ? "".concat(f, "= ").concat(code_gen_config_1.$userProperty) : "".concat(f, " =  tp.prop_or_default(").concat(code_gen_config_1.$request, "->'data' ,'").concat(f, "',v.").concat(f, ")"); }).join(", \r\n"), " WHERE ").concat(condition, ";")
        ], __read(makeCalcParts(settings, fields, other, false)), false), [
            (0, code_gen_util_1.returnSelectQuery)("v", settings, "get", condition)
        ], false).join("\r\n")
    }, (_d = (_c = (_b = (_a = other.allEntities.find(function (e) { return e.name === settings.entityName; })) === null || _a === void 0 ? void 0 : _a.definition) === null || _b === void 0 ? void 0 : _b.views) === null || _c === void 0 ? void 0 : _c.find(function (v) { return v.name === "".concat(settings.entityName, "_get"); })) === null || _d === void 0 ? void 0 : _d.fieldNames) : "";
};
exports.makeUpdateFunction = makeUpdateFunction;
var makeGetFunction = function (settings, viewFields) {
    var condition = (0, code_gen_util_1.whereKeyMatches)("v", settings);
    return condition ? (0, code_gen_util_1.dropAndMakeFunction)(settings, code_gen_config_1.functionNames.GET, {
        body: (0, code_gen_util_1.returnSelectQuery)("v", settings, "get", condition)
    }, viewFields) : "";
};
exports.makeGetFunction = makeGetFunction;
//TODO: discuss search/find/settings we want to pass
var makeListFunction = function (settings, viewFields) {
    var pkField = settings.entityFields.find(function (f) { return f.PK; });
    return pkField ? (0, code_gen_util_1.dropAndMakeFunction)(settings, code_gen_config_1.functionNames.LIST, {
        body: (0, code_gen_util_1.returnSelectQuery)("v", settings, "list", "CASE WHEN  request->'data' ? 'ids' THEN  v.".concat(pkField.name, " in (SELECT value::").concat((0, code_gen_config_1.dtExchanger)(pkField.dataType), " from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end")
        //settings.entityFields.filter((f) => f.filter).map((f) => `v.${f.name}=${$dataProperty(f.name, f.dataType || "")}`).join(" and ")
        )
    }, viewFields) : "/**** [".concat(settings.entityName, "] Primary Key is missing .....Cant create a list statement ****/");
};
exports.makeListFunction = makeListFunction;
var makeFunctionDef = function (entity, validFields, isTest, settings, other) {
    var _a, _b, _c, _d, _e;
    var funcSettings = {
        entityFields: validFields,
        entityName: entity.name,
        tableNameOverride: ((_a = entity.definition) === null || _a === void 0 ? void 0 : _a.tableNameOverride) || "",
        isTest: isTest
    };
    return [
        ((_b = settings.INSERT) === null || _b === void 0 ? void 0 : _b.fieldNames.length) ? (0, exports.makeInsertFunction)(funcSettings, settings.INSERT.fieldNames, other) : "",
        ((_c = settings.UPDATE) === null || _c === void 0 ? void 0 : _c.fieldNames.length) ? (0, exports.makeUpdateFunction)(funcSettings, settings.UPDATE.fieldNames, other) : "",
        ((_d = settings.GET) === null || _d === void 0 ? void 0 : _d.fieldNames.length) ? (0, exports.makeGetFunction)(funcSettings, settings.GET.fieldNames) : "",
        ((_e = settings.LIST) === null || _e === void 0 ? void 0 : _e.fieldNames.length) ? (0, exports.makeListFunction)(funcSettings, settings.LIST.fieldNames) : ""
    ].join("\r\n\r\n");
};
exports.makeFunctionDef = makeFunctionDef;
