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
exports.__esModule = true;
var exec_async_1 = require("../../../../utilities/exec-async");
var path_1 = require("path");
var misc_1 = require("./misc");
require("dotenv/config");
var readline_1 = require("readline");
var node_fetch_1 = require("node-fetch");
// import term from 'terminate'
//This is something
var config = (function () {
    var _a;
    var validConfigs = ["LOCAL", "DEV", "TEST"];
    var config = ((_a = process.argv[2]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "DEV";
    if (!validConfigs.find(function (t) { return t === config; }))
        throw new Error("Unknown configuration type ".concat(config, ". Only the following values are supported : ").concat(validConfigs.join("|"), " "));
    else
        return config;
})();
var startApiServer = function () {
    var proc;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!true) return [3 /*break*/, 2];
                return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (proc) {
                                        (0, exec_async_1.removeSpawnPrc)("api");
                                        logKey = "main";
                                    }
                                    proc = (0, exec_async_1.spawnVerbose)("Starting Api Server", "api", "npm run start --prefix ".concat((0, path_1.join)(misc_1.rootRepo, "services", "api")), {
                                        env: {
                                            PORT: process.env.API_PORT,
                                            "postgres": (function () {
                                                if (config === "LOCAL") {
                                                    if (!process.env.postgres)
                                                        throw new Error("'postgres' envrionmental variable must be configured to run LOCAL config.");
                                                    return process.env.postgres;
                                                }
                                                else
                                                    return undefined;
                                            })()
                                        }
                                    });
                                    return [4 /*yield*/, (0, exec_async_1.waitUntilVerbose)("Api Server has been started", function () { return __awaiter(_this, void 0, void 0, function () {
                                            var ex_1;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, (0, node_fetch_1["default"])("http://localhost:" + process.env.API_PORT)];
                                                    case 1: return [2 /*return*/, (_a.sent()).ok];
                                                    case 2:
                                                        ex_1 = _a.sent();
                                                        return [2 /*return*/, false];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); }, { maxRetries: 10, retryInterval: 2000 })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, proc];
                            }
                        });
                    }); })()];
            case 1:
                _a.sent();
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
}();
var printHelp = function (forceMain) {
    var log = exec_async_1.logs[forceMain ? "main" : logKey];
    log.push("####################################################################\r\n");
    log.push("############################### HELP ###############################\r\n");
    log.push("####################################################################\r\n");
    log.push("~Available Logs - Type the name of a long and hit return to switch to it\r\n");
    log.push("~Commands\r\n");
    Object.keys(exec_async_1.logs).forEach(function (lk) {
        log.push(lk + "\r\n");
    });
    log.push("~Commands\r\n");
    if (logKey === "api\r\n")
        log.push("(r)estart API Server\r\n");
    log.push("(h)elp\r\n");
    log.push("(q)uit\r\n");
    log.push("####################################################################\r\n");
};
var rl = (0, readline_1.createInterface)({
    input: process.stdin,
    output: process.stdout
});
var lastLogLength = 0;
var logKey = "main";
var keepReading = function () {
    rl.question('>', function (key) {
        if (key.length === 1) {
            switch (key) {
                case "r":
                    if (logKey === "api") {
                        startApiServer.next();
                    }
                case "h":
                    printHelp();
                case "q":
                    rl.close();
                    process.exit(0);
                    break;
            }
        }
        else {
            var log = exec_async_1.logs[key];
            if (log) {
                logKey = key;
                lastLogLength = 0;
            }
            else {
                console.log(">>>>Unknown Log:" + key);
            }
        }
        keepReading();
    });
};
keepReading();
rl.on('close', function () {
    console.log('\nBYE BYE !!!');
    process.exit(0);
});
setInterval(function () {
    var log = exec_async_1.logs[logKey];
    if (lastLogLength === 0)
        console.clear();
    if (lastLogLength !== log.length) {
        console.log(log.slice(lastLogLength, log.length).join(""));
        lastLogLength = log.length;
        process.stdout.write(">");
    }
}, 1000);
exec_async_1.logs.main.push("Launching TradingPost App in mode:".concat("WEB", " with configuration:").concat(config));
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (0, exec_async_1.spawnVerbose)("Starting Common Watcher...", "common", "npm run watch --prefix " + (0, path_1.join)(misc_1.rootRepo, "common"));
                return [4 /*yield*/, (0, exec_async_1.execVerboseAsync)("Linking Api Server To Common...", "npm run link-common  --prefix " + (0, path_1.join)(misc_1.rootRepo, "services", "api"))];
            case 1:
                _b.sent();
                return [4 /*yield*/, startApiServer.next().value];
            case 2:
                _b.sent();
                return [4 /*yield*/, (0, exec_async_1.execVerboseAsync)("Uninstall Common from TradingPost App", "npm uninstall @tradingpost/common")];
            case 3:
                _b.sent();
                if (!(config === "TEST")) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, exec_async_1.execVerboseAsync)("Installing Common to TradingPost App", "npm install @tradingpost/common")];
            case 4:
                _a = _b.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, exec_async_1.execVerboseAsync)("Linking Common to TradingPost App", "npm run link-common")];
            case 6:
                _a = _b.sent();
                _b.label = 7;
            case 7:
                _a;
                return [4 /*yield*/, (0, exec_async_1.spawnVerbose)("Starting TradingPost App", "app", "npm run web" + (config === "TEST" ? " --no-dev --minify" : ""))];
            case 8:
                _b.sent();
                exec_async_1.logs.main.push("Trading Post App Has Started!!!!!");
                printHelp();
                return [2 /*return*/];
        }
    });
}); })();
