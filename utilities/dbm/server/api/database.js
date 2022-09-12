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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = __importDefault(require("pg"));
var _1 = require(".");
require("dotenv/config");
var client_s3_1 = require("@aws-sdk/client-s3");
var code_gen_1 = require("../../src/shared/code/code-gen");
var fs_1 = require("fs");
var path_1 = require("path");
var code_gen_util_1 = require("../../src/shared/code/code-gen-util");
var configuration_1 = require("@tradingpost/common/configuration");
//const debug = true;
var client = new client_s3_1.S3Client({
    region: "us-east-1"
});
// const hive = new pg.Pool({
//     host: "localhost",
//     user: "postgres",
//     password: "V5tbh@vyPG3",
//     database: "HIVE"
// });
// const pool = new pg.Pool({
//     host: "localhost",
//     user: "postgres",
//     password: "V5tbh@vyPG3",
//     database: "DBM"
// });
// export const execProc = async <Result = any, Count extends number = 0, T extends Record<string, any> = any>(proc: string, prms?: T, ensureCount?: Count, ensureCountMessage?: string): Promise<Count extends 1 ? Result : Result[]> => {
//     const result = prms ? await pool.query(`SELECT * FROM ${proc}($1)`, [JSON.stringify(prms)]) :
//         await pool.query(`SELECT * FROM ${proc}()`)
//     if (ensureCount && result.rowCount !== ensureCount) {
//         const defaultError = `Invalid number of results. Expected ${ensureCount} Received:${result.rowCount}`;
//         if (debug) {
//             console.error(defaultError);
//         }
//         throw new ApiError(ensureCountMessage || defaultError, { procedure: proc, parameters: prms });
//     }
//     if (ensureCount === 1)
//         return result.rows[0]
//     else return result.rows as (Count extends 1 ? Result : Result[]);
// }
// const execProcOne = async <Result = any, T extends Record<string, any> = any>(proc: string, prms?: T, ensureCountMessage?: string) => {
//     return await execProc<Result, 1, T>(proc, prms, 1, ensureCountMessage);
// }
var streamToString = function (stream) {
    return new Promise(function (resolve, reject) {
        var chunks = [];
        stream.on("data", function (chunk) { return chunks.push(chunk); });
        stream.on("error", reject);
        stream.on("end", function () { return resolve(Buffer.concat(chunks).toString("utf8")); });
    });
};
var pushJsonData = function (info) {
    var name = info.name, definition = info.definition;
    //const result = await execProcOne<Entity>("createEntity", { name });
    //return result;
    client.send(new client_s3_1.PutObjectCommand({
        Bucket: "entity-manager",
        // Add the required 'Key' parameter using the 'path' module.
        Key: "".concat(name, ".json"),
        // Add the required 'Body' parameter
        Body: JSON.stringify(definition) || "",
    }));
    return { name: name, definition: definition };
};
var getAllEntities = function () { return __awaiter(void 0, void 0, void 0, function () {
    var r, reads, _loop_1, _a, _b, c;
    var e_1, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, client.send(new client_s3_1.ListObjectsCommand({
                    Bucket: "entity-manager"
                }))];
            case 1:
                r = _d.sent();
                reads = [];
                if (r.Contents) {
                    _loop_1 = function (c) {
                        reads.push(client.send(new client_s3_1.GetObjectCommand({
                            Bucket: "entity-manager",
                            Key: c.Key,
                        })).then(function (r) { return __awaiter(void 0, void 0, void 0, function () {
                            var data;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, streamToString(r.Body)];
                                    case 1:
                                        data = _b.sent();
                                        return [2 /*return*/, {
                                                name: ((_a = c.Key) === null || _a === void 0 ? void 0 : _a.split(".")[0]) || "",
                                                definition: data ? JSON.parse(data) : ""
                                            }];
                                }
                            });
                        }); }));
                    };
                    try {
                        for (_a = __values(r.Contents), _b = _a.next(); !_b.done; _b = _a.next()) {
                            c = _b.value;
                            _loop_1(c);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                return [4 /*yield*/, Promise.all(reads)];
            case 2: return [2 /*return*/, _d.sent()];
        }
    });
}); };
var getDBPool = (function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = pg_1.default.Pool).bind;
                if (!process.env.TEST) return [3 /*break*/, 1];
                _c = {
                    host: "localhost",
                    user: "postgres",
                    password: "V5tbh@vyPG3",
                    database: "HIVE"
                };
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, configuration_1.DefaultConfig.fromCacheOrSSM("postgres")];
            case 2:
                _c = (_d.sent());
                _d.label = 3;
            case 3: return [2 /*return*/, new (_b.apply(_a, [void 0, _c]))()];
        }
    });
}); })();
function updateServer() {
    return __awaiter(this, void 0, void 0, function () {
        var pool, files, files_1, files_1_1, f, e_2_1;
        var e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDBPool];
                case 1:
                    pool = _b.sent();
                    files = ["tables", "views", "functions"];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, 8, 9]);
                    files_1 = __values(files), files_1_1 = files_1.next();
                    _b.label = 3;
                case 3:
                    if (!!files_1_1.done) return [3 /*break*/, 6];
                    f = files_1_1.value;
                    return [4 /*yield*/, pool.query((0, fs_1.readFileSync)("".concat(f, ".sql"), "utf8"))];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    files_1_1 = files_1.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/, { "ok": "ok" }];
            }
        });
    });
}
function getTableDefs(tableName) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("TABLE NAME" + tableName);
                    return [4 /*yield*/, getDBPool];
                case 1: return [4 /*yield*/, (_a.sent()).query("SELECT *, \n    ((SELECT json_agg(x) FROM (select tco.constraint_name, kcu.column_name as key_column\n    from information_schema.table_constraints tco\n    join information_schema.key_column_usage kcu \n         on kcu.constraint_name = tco.constraint_name\n         and kcu.constraint_schema = tco.constraint_schema\n         and kcu.constraint_name = tco.constraint_name\n    where tco.constraint_type = 'PRIMARY KEY' \n                              and tco.table_name = \"columns\".table_name \n                              and tco.table_schema = \"columns\".table_schema  \n                              and kcu.column_name = \"columns\".column_name ) as x )->>0)::json as primary_key_data\n        FROM information_schema.columns WHERE \n            table_schema = 'public'" + (tableName ?
                        " and table_name = '".concat(tableName, "'") : ''))];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.rows];
            }
        });
    });
}
var calls = {
    createEntity: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, pushJsonData(req.body)];
        });
    }); },
    updateEntity: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, pushJsonData(req.body)];
        });
    }); },
    getTableDefinitions: function (req) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTableDefs()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    updateServer: updateServer,
    createSQLDiff: function (req) { return __awaiter(void 0, void 0, void 0, function () {
        var entities, runTest, tableDefs, viewDefs, functionDefs, apiDefs, interfacesDefs, makeOrGetDef, allViewsInfo, tds, viewsRequired, maxLoops, i, viewOutput, output, testQuery, pool, client_1, results, extensionPlaceHolder, baseSourcePath, entitySourcePath, apiExtensionsPath, imports, realExts, outputPathForExt, staticFileNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllEntities()];
                case 1:
                    entities = _a.sent();
                    runTest = req.body.runTest;
                    tableDefs = [];
                    viewDefs = {};
                    functionDefs = [];
                    apiDefs = {};
                    interfacesDefs = {};
                    makeOrGetDef = function (viewName) {
                        return viewDefs[viewName] || (viewDefs[viewName] = {
                            definition: "#UNDEFINED",
                            dependants: new Set(),
                            dependsOn: new Set()
                        });
                    };
                    allViewsInfo = [];
                    return [4 /*yield*/, getTableDefs()];
                case 2:
                    tds = _a.sent();
                    entities.forEach(function (e) {
                        //if column needs a view that view is needed at a higher level
                        var defs = (0, code_gen_1.makeEntityDefs)(e, {}, runTest, tds.filter(function (td) { var _a; return td.table_name === (((_a = e.definition) === null || _a === void 0 ? void 0 : _a.tableNameOverride) || "data_".concat((0, code_gen_util_1.ensureSnake)(e.name))); }), entities);
                        if (defs) {
                            tableDefs.push(defs.table);
                            functionDefs.push(defs.functions);
                            allViewsInfo.push.apply(allViewsInfo, __spreadArray([], __read(Object.keys(defs.views).map(function (name) { return ({
                                entityName: e.name,
                                name: name,
                                definition: defs.views[name].definition,
                                fields: defs.views[name].fieldNames.map(function (fn) { return defs.fields[fn]; })
                            }); })), false));
                            apiDefs[e.name] = defs.api;
                            interfacesDefs[e.name] = defs.interfaces;
                        }
                    });
                    allViewsInfo.forEach(function (view) {
                        var viewDef = makeOrGetDef(view.name);
                        viewDef.definition = view.definition;
                        var addDepends = function (depenViewName) {
                            //HACK NEED TO FIGURE OUT WHY THIS IS HAPPENING
                            if (depenViewName !== view.name) {
                                var dependency = makeOrGetDef(depenViewName);
                                dependency.dependants.add(view.name);
                                viewDef.dependsOn.add(view.name);
                            }
                        };
                        //Add all dependency
                        view.fields.forEach(function (field) {
                            var _a = field || {}, calcType = _a.calcType, calc = _a.calc;
                            //console.log(field)
                            if ((0, code_gen_util_1.isSplitCalc)(calcType || "") && calc)
                                addDepends(calc.split("|")[0]);
                            else if (calcType === "inline" && calc) {
                                allViewsInfo.forEach(function (_view) {
                                    //HACKY:probably should be a parser...
                                    if (calc.toLowerCase().indexOf(_view.name.toLowerCase()) >= 0)
                                        addDepends(_view.name);
                                });
                            }
                        });
                        viewDefs[view.name] = viewDef;
                    });
                    viewsRequired = new Set(Object.keys(viewDefs));
                    maxLoops = 100000;
                    i = 0;
                    viewOutput = [];
                    while (Boolean(viewsRequired.size) && i <= maxLoops) {
                        __spreadArray([], __read(viewsRequired.values()), false).forEach(function (vr) {
                            var curDef = viewDefs[vr];
                            if (!curDef.dependsOn.size) {
                                //remove all dependants 
                                curDef.dependants.forEach(function (d) {
                                    return viewDefs[d].dependsOn.delete(vr);
                                });
                                //create the view
                                viewOutput.push(curDef.definition);
                                viewsRequired.delete(vr);
                            }
                            else {
                                //HACK I NEED TO FIX...
                                if (curDef.dependsOn.size === 1 && curDef.dependsOn.has(vr)) {
                                    curDef.dependsOn.delete(vr);
                                }
                            }
                        });
                        i++;
                    }
                    //HACKY ... can make a cleaner check later 
                    if (i >= maxLoops) {
                        throw new Error("Possible circular dependency" + JSON.stringify(Array.from(viewsRequired)));
                    }
                    output = [];
                    if (!!runTest) return [3 /*break*/, 3];
                    (0, fs_1.writeFileSync)("tables.sql", tableDefs.join("\r\n\r\n"));
                    (0, fs_1.writeFileSync)("views.sql", viewOutput.join("\r\n\r\n"));
                    (0, fs_1.writeFileSync)("functions.sql", functionDefs.join("\r\n\r\n"));
                    return [3 /*break*/, 8];
                case 3:
                    testQuery = __spreadArray(__spreadArray(__spreadArray(__spreadArray(["DROP TABLE IF EXISTS errors;CREATE TEMP TABLE errors (type TEXT,entityName TEXT, name TEXT,columnname text, message TEXT, context TEXT, detail TEXT);"], __read(tableDefs), false), __read(viewOutput), false), __read(functionDefs), false), __read(allViewsInfo.map(function (v) {
                        return "DO\n$$\nDECLARE\nerr text;\nctx text;\ncol_name text;\ndet text;\nBEGIN\n    PERFORM pg_temp.view_".concat(v.name, "('{\"userId\":\"00000000-0000-0000-0000-000000000000\"}');\nEXCEPTION WHEN OTHERS THEN\n     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;\n     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)\n     SELECT 'view' ,'").concat(v.entityName, "','").concat(v.name, "' ,col_name,err, ctx, det ;\nEND;\n$$;");
                    })), false).join("\r\n");
                    (0, fs_1.writeFileSync)("tests.sql", testQuery);
                    return [4 /*yield*/, getDBPool];
                case 4:
                    pool = _a.sent();
                    return [4 /*yield*/, pool.connect()];
                case 5:
                    client_1 = _a.sent();
                    return [4 /*yield*/, client_1.query(testQuery)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, client_1.query("SELECT * FROM errors")];
                case 7:
                    results = _a.sent();
                    console.log(results.rows);
                    output = results.rows;
                    _a.label = 8;
                case 8:
                    extensionPlaceHolder = '/*extensions*/';
                    baseSourcePath = (0, path_1.join)(__dirname, "..", "..", "..", "..", "common", "api");
                    entitySourcePath = (0, path_1.join)(baseSourcePath, "entities");
                    apiExtensionsPath = (0, path_1.join)(entitySourcePath, "extensions");
                    imports = ["import * as Dummy  from \"../extensions\""];
                    realExts = [];
                    Object.keys(apiDefs).forEach(function (d) {
                        var name = (0, code_gen_util_1.ensurePascalCase)(d);
                        if ((0, fs_1.existsSync)((0, path_1.join)(apiExtensionsPath, name + ".ts"))) {
                            imports.push("import * as ".concat(name, " from '../extensions/").concat(name, "'"));
                            realExts.push(name);
                            //data.push(`${name}: ${name}Ext`)
                        }
                        else {
                            imports.push("export const ".concat(name, " = Dummy"));
                        }
                    });
                    imports.push("export {".concat(realExts.join(","), "}"));
                    outputPathForExt = (0, path_1.join)(entitySourcePath, "apis", "extensions.ts");
                    console.log("WRITTING TO PATH EXT: " + outputPathForExt);
                    (0, fs_1.writeFileSync)(outputPathForExt, imports.join("\r\n") // + "\r\n" +
                    //    `export default { ${data.join(",\r\n")}  }`
                    );
                    console.log("FINISHED WRITTING TO PATH EXT: " + outputPathForExt);
                    [entitySourcePath
                        //,
                        //    join(__dirname, "..", "..", "..", "..", "app", "tradingpost", "api", "entities")
                    ].forEach(function (apiBasePath) {
                        var apiInterfacesPath = (0, path_1.join)(apiBasePath, "interfaces");
                        var apiOutputPath = (0, path_1.join)(apiBasePath, "apis");
                        // baseFilesNames.forEach((baseFileName) => {
                        //     copyFileSync(join(apiTemplatePath, baseFileName), join(apiOutputPath, baseFileName));
                        // })
                        //TODO need to add delete of all existing files
                        Object.keys(apiDefs).forEach(function (d) {
                            console.log("Writting TO " + (0, path_1.join)(apiOutputPath, "".concat((0, code_gen_util_1.ensurePascalCase)(d), "Api.ts")));
                            (0, fs_1.writeFileSync)((0, path_1.join)(apiOutputPath, "".concat((0, code_gen_util_1.ensurePascalCase)(d), "Api.ts")), apiDefs[d]);
                        });
                        var allIDefs = [];
                        allIDefs.push("import * as Statics from '../static/interfaces'");
                        Object.keys(interfacesDefs).forEach(function (d) {
                            allIDefs.push(interfacesDefs[d]);
                        });
                        //Add static interfaces 
                        allIDefs.push("export * from '../static/interfaces'");
                        (0, fs_1.writeFileSync)((0, path_1.join)(apiInterfacesPath, "index.ts"), allIDefs.join("\r\n\r\n"));
                    });
                    staticFileNames = (0, fs_1.readdirSync)((0, path_1.join)(entitySourcePath, "static")).filter(function (v) {
                        return /.+Api\.ts/.test(v) && v !== "EntityApi.ts";
                    }).map(function (n) { return ({
                        short: n.substring(0, n.length - 6),
                        long: n.substring(0, n.length - 3),
                    }); });
                    (0, fs_1.writeFileSync)((0, path_1.join)(baseSourcePath, "index.ts"), [
                        //static Imports 
                        staticFileNames.length ? staticFileNames.map(function (v) { return "import ".concat(v.short, " from './entities/static/").concat(v.long, "'"); }).join("\r\n") : "",
                        //dynamic Imports
                        Object.keys(apiDefs).map(function (v) { return "import ".concat((0, code_gen_util_1.ensurePascalCase)(v), " from './entities/apis/").concat((0, code_gen_util_1.ensurePascalCase)(v), "Api'"); }).join("\r\n"),
                        //All Interfaces
                        "export * as Interface from './entities/interfaces'",
                        "export const Api:{ ",
                        Object.keys(apiDefs).map(function (v) { return (0, code_gen_util_1.ensurePascalCase)(v) + ": typeof " + (0, code_gen_util_1.ensurePascalCase)(v); }).join(",") + ",",
                        //All Static Apis
                        staticFileNames.length ? staticFileNames.map(function (v) { return v.short + ": typeof " + v.short; }).join(",") : "",
                        "}",
                        " = {",
                        //All Dynamic Apis
                        Object.keys(apiDefs).map(function (v) { return (0, code_gen_util_1.ensurePascalCase)(v); }).join(",") + ",",
                        //All Static Apis
                        staticFileNames.length ? staticFileNames.map(function (v) { return v.short; }).join(",") : "",
                        "}"
                    ].join("\r\n"));
                    //entities/interfaces
                    // Object.keys(interfacesDefs).forEach(d => {
                    //     console.log("Writting TO " + join(apiInterfacesPath, `I${ensurePascalCase(d)}Api.ts`));
                    //     writeFileSync(join(apiInterfacesPath, `I${ensurePascalCase(d)}.ts`), interfacesDefs[d]);
                    // });
                    return [2 /*return*/, output];
            }
        });
    }); },
    // getCode: async (req, res, next) => {
    //     const tds = await getTableDefs(`data_${ensureSnake(req.body.entity.name)}`);
    //     makeEntityDefs(req.body.entity, req.body.deleteFields || [], false, tds);
    // },
    lockEntity: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    }); },
    unlockEntity: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    }); },
    getEntity: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var name, r, _a, _b, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    name = req.body.name;
                    return [4 /*yield*/, client.send(new client_s3_1.GetObjectCommand({
                            Bucket: "entity-manager",
                            Key: name + ".json",
                        }))];
                case 1:
                    r = _e.sent();
                    _d = {
                        name: name
                    };
                    if (!r.Body) return [3 /*break*/, 3];
                    _c = (_b = JSON).parse;
                    return [4 /*yield*/, streamToString(r.Body)];
                case 2:
                    _a = _c.apply(_b, [_e.sent()]);
                    return [3 /*break*/, 4];
                case 3:
                    _a = "";
                    _e.label = 4;
                case 4: return [2 /*return*/, (_d.definition = _a,
                        _d)];
            }
        });
    }); },
    listEntity: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllEntities()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    testEntities: function () {
        //create temp tables
        //select from temp data as view
    }
};
exports.default = (0, _1.toLowerProps)(calls);
