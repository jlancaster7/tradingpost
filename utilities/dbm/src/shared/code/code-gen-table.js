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
exports.makeTableDef = void 0;
var code_gen_config_1 = require("./code-gen-config");
var makeTableDef = function (entityName, tableName, fields, isTemp, existingFields, pkName) {
    var tableDef = "";
    var realFields = fields
        .filter(function (f) { return !f.calcType; });
    if (!(existingFields === null || existingFields === void 0 ? void 0 : existingFields.length))
        //DROP TABLE IF EXISTS ${tableName}; \r\n 
        tableDef = "CREATE ".concat(isTemp ? "TEMP" : "", " TABLE ").concat((isTemp ? "pg_temp." : "") + tableName, "(\r\n").concat(__spreadArray(__spreadArray([], __read(realFields.map(function (f) {
            return "    ".concat(f.name, " ").concat(f.dataType.toUpperCase()).concat(f.PK ? " PRIMARY KEY" : "").concat(f.nullable || !f.PK ? "" : " NOT NULL").concat(f.dataType === "UUID" && f.PK ? " DEFAULT gen_random_uuid()" : "");
        })), false), ["    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
            "    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",], false).join(",\r\n"), ");");
    else {
        //create alter statement 
        var drops = existingFields.filter(function (f) { return f.name !== 'created_at' && f.name !== 'updated_at' && !realFields.find(function (_f) { return _f.name === f.name; }); }).map(function (f) { return "DROP COLUMN ".concat(f.name); });
        var adds = realFields.filter(function (f) { return !existingFields.find(function (_f) { return _f.name === f.name; }); }).map(function (f) { return "ADD COLUMN ".concat(f.name, " ").concat(f.dataType.toUpperCase()).concat(f.nullable ? "" : " NOT NULL"); });
        var alters = existingFields.filter(function (f) { return realFields.find(function (_f) { return _f.name === f.name &&
            ((0, code_gen_config_1.dtExchanger)(_f.dataType).toUpperCase() !== f.dataType.toUpperCase()); }); }).map(function (f) { var _a; return "ALTER COLUMN ".concat(f.name, " TYPE ").concat((0, code_gen_config_1.dtExchanger)(((_a = realFields.find(function (_f) { return _f.name === f.name; })) === null || _a === void 0 ? void 0 : _a.dataType)).toUpperCase()); });
        var nullables = existingFields.filter(function (f) { return realFields.find(function (_f) { return _f.name === f.name && (f.nullable || false) !== (_f.nullable || false); }); })
            .map(function (f) { return "ALTER COLUMN ".concat(f.name, "  ").concat(f.nullable ? "SET" : "DROP", " NOT NULL"); });
        //check if PK exists 
        var currentPk = realFields.find(function (f) { return f.PK; });
        var existingPk = existingFields.find(function (f) { return f.PK; });
        var constraints = [];
        //if there is a mismatch then drop the existing pk
        if ((currentPk === null || currentPk === void 0 ? void 0 : currentPk.name) !== (existingPk === null || existingPk === void 0 ? void 0 : existingPk.name) || existingPk && !currentPk || currentPk && !existingPk) {
            //drop existing
            if (existingPk)
                constraints.push("DROP CONSTRAINT ".concat(pkName));
            //add next 
            if (currentPk)
                constraints.push("ADD PRIMARY KEY(".concat(currentPk.name, ")"));
        }
        //"{""constraint_name"":""Watchlist_pkey"",""key_column"":""id""}"
        //const nullables = existingFields.filter((f) => !fields.find(_f => _f.name === f.name)).map((f) => `ALTER COLUMN ${f.name} ${f.dataType.toUpperCase()}}${f.nullable ? "" : " NOT NULL"}`)
        // Cn add renames
        var testOut = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(drops), false), __read(adds), false), __read(alters), false), __read(nullables), false), __read(constraints), false);
        if (testOut.length) {
            tableDef = [
                "ALTER TABLE ".concat(tableName),
                testOut.join(",\r\n")
            ].join("\r\n") + ";";
        }
        else {
            tableDef = "/* No changes to ".concat(tableName, " [").concat(entityName, "]*/");
        }
    }
    return tableDef;
};
exports.makeTableDef = makeTableDef;
