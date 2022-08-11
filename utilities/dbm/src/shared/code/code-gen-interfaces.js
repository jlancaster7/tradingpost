"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInterfaceDef = void 0;
var code_gen_util_1 = require("./code-gen-util");
var data_type_map_1 = require("./data-type-map");
var makeInterfaceDef = function (v, fields, deleteFields, isUpsertView, isUpdate) {
    return "export interface I".concat((0, code_gen_util_1.ensurePascalCase)(v.name), " {\n    ").concat(v.fieldNames.filter(function (fn) { return !deleteFields[fn]; }).map(function (fn) {
        var _a, _b, _c;
        var field = fields === null || fields === void 0 ? void 0 : fields.find(function (f) { return f.name === fn; });
        return "    ".concat(fn).concat((field === null || field === void 0 ? void 0 : field.nullable) || isUpdate ? "?" : "", ": ").concat((field === null || field === void 0 ? void 0 : field.dataType) === "json" ?
            //Sets the associated view OR manual type set in the "maxLength" field if there is no calc type
            (field.calcType === "json" ?
                (!isUpsertView ? "I".concat((0, code_gen_util_1.ensurePascalCase)(((_a = field.calc) === null || _a === void 0 ? void 0 : _a.split("|")[0]) || ""), "[]") :
                    //Hacky:::This needs to be fixed to allow user to select a view to upsert from the DBM or me never on the upsert... good enough for now.
                    "Omit<I".concat((0, code_gen_util_1.ensurePascalCase)(((_b = field.calc) === null || _b === void 0 ? void 0 : _b.split("|")[0]) || ""), ",'").concat((_c = field.calc) === null || _c === void 0 ? void 0 : _c.split("|")[1], "'|'id'>[]"))
                : field.maxLength) :
            (data_type_map_1.DataTypeMap[field === null || field === void 0 ? void 0 : field.dataType] || "unknown"));
    }).join(",\r\n"), "\n    };");
};
exports.makeInterfaceDef = makeInterfaceDef;
