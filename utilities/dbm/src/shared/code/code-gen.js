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
exports.makeEntityDefs = void 0;
var code_gen_api_1 = require("./code-gen-api");
var code_gen_config_1 = require("./code-gen-config");
var code_gen_functions_1 = require("./code-gen-functions");
var code_gen_interfaces_1 = require("./code-gen-interfaces");
var code_gen_table_1 = require("./code-gen-table");
var code_gen_views_1 = require("./code-gen-views");
//        //"timestamp with time zone"
//will rename on refactor
var dtRemapper = {};
var makeEntityDefs = function (entity, deleteFields, isTest, existingFields, allEntities) {
    var _a, _b, _c, _d, _e, _f, _g;
    var definition = entity.definition;
    if (definition) {
        var _h = definition.views, _ogViews = _h === void 0 ? [] : _h, fields_1 = definition.fields, views = __spreadArray([], __read(_ogViews), false), validFields = (fields_1 === null || fields_1 === void 0 ? void 0 : fields_1.filter(function (f) { return !deleteFields[f.name] && !f.draft; })) || [], fieldMap_1 = {};
        validFields.forEach(function (f) {
            fieldMap_1[f.name] = f;
        });
        var namedViews_1 = tidyUpViews(entity.name, views, fieldMap_1);
        return {
            table: (0, code_gen_table_1.makeTableDef)(entity.name, ((_a = entity.definition) === null || _a === void 0 ? void 0 : _a.tableNameOverride) || "".concat(code_gen_config_1.prefixes.DATA, "_").concat(entity.name), validFields, isTest, existingFields.length ? existingFields.map(function (f) { return ({
                dataType: (0, code_gen_config_1.dtExchanger)(f.data_type),
                name: f.column_name,
                nullable: f.is_nullable === "YES",
                PK: Boolean(f.primary_key_data)
            }); }) : undefined, (_c = (_b = existingFields.find(function (f) { return f.primary_key_data; })) === null || _b === void 0 ? void 0 : _b.primary_key_data) === null || _c === void 0 ? void 0 : _c.constraint_name),
            views: (0, code_gen_views_1.makeViewDef)(entity, views, validFields, fieldMap_1, isTest),
            interfaces: (views === null || views === void 0 ? void 0 : views.map(function (v) { return (0, code_gen_interfaces_1.makeInterfaceDef)(v, fields_1, deleteFields, v === namedViews_1.UPDATE || v === namedViews_1.INSERT, v === namedViews_1.UPDATE); }).join("\r\n\r\n")) || "",
            fields: fieldMap_1,
            functions: (0, code_gen_functions_1.makeFunctionDef)(entity, validFields, isTest, namedViews_1, { allEntities: allEntities }),
            api: (0, code_gen_api_1.makeApiDef)(entity.name, isTest, {
                get: Boolean((_d = namedViews_1.GET) === null || _d === void 0 ? void 0 : _d.fieldNames.length),
                list: Boolean((_e = namedViews_1.LIST) === null || _e === void 0 ? void 0 : _e.fieldNames.length),
                update: Boolean((_f = namedViews_1.UPDATE) === null || _f === void 0 ? void 0 : _f.fieldNames.length),
                insert: Boolean((_g = namedViews_1.INSERT) === null || _g === void 0 ? void 0 : _g.fieldNames.length)
            })
        };
    }
    else {
        return null;
    }
};
exports.makeEntityDefs = makeEntityDefs;
var tidyUpViews = function (entityName, views, fieldMap) {
    var prefix = "".concat(entityName.toLowerCase(), "_");
    //clean up view names if needed
    var upsertIndex = null;
    views.forEach(function (v, i) {
        if (!v.name.startsWith(prefix))
            v.name = prefix + v.name;
        if (v.name === prefix + "upsert")
            upsertIndex = i;
    });
    if (upsertIndex) {
        //break out upsert views
        views.splice(upsertIndex, 1, { name: "".concat(prefix).concat(code_gen_config_1.functionNames.INSERT), fieldNames: views[upsertIndex].fieldNames.filter(function (f) { return !fieldMap[f].PK; }) }, { name: "".concat(prefix).concat(code_gen_config_1.functionNames.UPDATE), fieldNames: views[upsertIndex].fieldNames });
    }
    return {
        GET: views.find(function (v) { return v.name === "".concat(prefix).concat(code_gen_config_1.functionNames.GET); }),
        INSERT: views.find(function (v) { return v.name === "".concat(prefix).concat(code_gen_config_1.functionNames.INSERT); }),
        LIST: views.find(function (v) { return v.name === "".concat(prefix).concat(code_gen_config_1.functionNames.LIST); }),
        UPDATE: views.find(function (v) { return v.name === "".concat(prefix).concat(code_gen_config_1.functionNames.UPDATE); })
    };
};
