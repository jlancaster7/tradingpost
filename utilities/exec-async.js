"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.__esModule = true;
exports.waitUntilVerbose = exports.waitUntil = exports.removeSpawnPrc = exports.spawnVerbose = exports.spawnCmd = exports.procs = exports.logs = exports.execVerboseAsync = exports.execAsync = void 0;
var child_process_1 = require("child_process");
var terminate_1 = require("terminate");
//function Cleanup(callback) {
// attach user callback to the process event emitter
// if no callback, it will still exit gracefully on Ctrl-C
//callback = callback || noOp;
process.on('cleanup', function () {
    console.log("I hit cleanup");
    cleanAllProcs();
});
var cleanAllProcs = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, k, proc;
    return __generator(this, function (_b) {
        for (_i = 0, _a = Object.keys(exports.procs); _i < _a.length; _i++) {
            k = _a[_i];
            console.log("Killing.... " + k);
            proc = exports.procs[k];
            if (proc.pid) {
                (0, terminate_1["default"])(proc.pid, function (err) {
                });
            }
            // await new Promise((resolve) => {
            //     try {
            //         }
            //     }
            //     catch (ex) {
            //         console.error(ex);
            //     }
            // })
            console.log("Killed.... " + k);
        }
        return [2 /*return*/];
    });
}); };
// do app specific cleaning before exiting
process.on('exit', function () {
    console.log("Cleaning Up....Magic");
    process.emit("cleanup");
});
// catch ctrl+c event and exit normally
process.on('SIGINT', function () {
    console.log('Ctrl-C...');
    process.exit(2);
    // cleanAllProcs().then(() => );
    // ;
});
//catch uncaught exceptions, trace, then exit normally
process.on('uncaughtException', function (e) {
    //cleanAllProcs().then(() => {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
    //})
});
//};
var execAsync = function (cmd, options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, err, stderr, stdout, errorMessage, output;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    try {
                        exports.logs.main.push("Exec Async: ".concat(cmd) + "\r\n");
                        var proc = (0, child_process_1.exec)(cmd, options, function (err, stdout, stderr) {
                            resolve({
                                err: err,
                                stdout: stdout,
                                stderr: stderr
                            });
                        });
                    }
                    catch (ex) {
                        reject(ex);
                    }
                })];
            case 1:
                _a = _b.sent(), err = _a.err, stderr = _a.stderr, stdout = _a.stdout;
                if (stderr) {
                    errorMessage = typeof stderr === "string" ? stderr : stderr.toString('utf8');
                    exports.logs.main.push("######## STDERR #########" + "\r\n");
                    exports.logs.main.push(errorMessage) + "\r\n";
                    exports.logs.main.push("######## EOF STDERR #########" + "\r\n");
                    //throw new Error(errorMessage)
                }
                output = typeof stdout === "string" ? stdout : stdout.toString('utf8');
                exports.logs.main.push(output + "\r\n");
                if (err)
                    throw err;
                return [2 /*return*/, output];
        }
    });
}); };
exports.execAsync = execAsync;
var execVerboseAsync = function (message) {
    var prms = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        prms[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exports.logs.main.push(message + "\r\n");
                    return [4 /*yield*/, (0, exports.execAsync)(prms[0], prms[1])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.execVerboseAsync = execVerboseAsync;
exports.logs = {
    main: []
};
exports.procs = {};
var clearCharacter = "c";
var spawnCmd = function (prefix, cmd, options) {
    var _a, _b;
    if (exports.logs[prefix])
        throw new Error("Prefix is already taken. Please use another.");
    var log = (exports.logs[prefix] = []);
    log.push("".concat(prefix, "^>").concat(cmd));
    var finalOPtions = __assign({ detached: true, shell: true }, options);
    var proc = exports.procs[prefix] =
        (0, child_process_1.spawn)(cmd, finalOPtions || {});
    console.log("Starting Spawn with pid of :::" + proc.pid);
    //const proc = spawn("tsc",["-w", "C:\\Users\\lever\\Documents\\Hive\\repo\\common"] ,finalOPtions||{});
    (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (d) {
        //if (d !== clearCharacter) {
        log.push("".concat(prefix, "::>").concat(d));
        //}
    });
    (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
        log.push("".concat(prefix, "!!>").concat(data));
    });
    // proc.on("error", (msg) => {
    //     console.error(msg);
    // })
    proc.on('close', function (code) {
        log.push("".concat(prefix, "$>").concat(code));
    });
    return proc;
};
exports.spawnCmd = spawnCmd;
var spawnVerbose = function (message) {
    var prms = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        prms[_i - 1] = arguments[_i];
    }
    exports.logs.main.push(message + "\r\n");
    return (0, exports.spawnCmd)(prms[0], prms[1], prms[2]);
};
exports.spawnVerbose = spawnVerbose;
var removeSpawnPrc = function (key) {
    delete exports.logs[key];
    var proc = exports.procs[key];
    if (proc)
        proc.kill();
};
exports.removeSpawnPrc = removeSpawnPrc;
var waitUntil = function (test, settings) { return __awaiter(void 0, void 0, void 0, function () {
    var _settings, numberOfTries, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _settings = settings || {};
                _settings.maxRetries = _settings.maxRetries || Number.MAX_SAFE_INTEGER;
                _settings.retryInterval = _settings.retryInterval || 1000;
                numberOfTries = -1;
                _b.label = 1;
            case 1:
                _a = numberOfTries <= _settings.maxRetries;
                if (!_a) return [3 /*break*/, 3];
                return [4 /*yield*/, test({ numberOfTries: ++numberOfTries })];
            case 2:
                _a = !(_b.sent());
                _b.label = 3;
            case 3:
                if (!_a) return [3 /*break*/, 4];
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.waitUntil = waitUntil;
var waitUntilVerbose = function (message) {
    var prms = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        prms[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.waitUntil)(prms[0], prms[1])];
                case 1:
                    _a.sent();
                    exports.logs.main.push(message + "\r\n");
                    return [2 /*return*/];
            }
        });
    });
};
exports.waitUntilVerbose = waitUntilVerbose;
