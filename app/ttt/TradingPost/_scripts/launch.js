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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_async_1 = require("../../../../utilities/exec-async");
const path_1 = require("path");
const misc_1 = require("./misc");
require("dotenv/config");
const readline_1 = require("readline");
const node_fetch_1 = __importDefault(require("node-fetch"));
//This is something
const config = (() => {
    var _a;
    const validConfigs = ["LOCAL", "DEV", "TEST"];
    const config = ((_a = process.argv[2]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "DEV";
    if (!validConfigs.find(t => t === config))
        throw new Error(`Unknown configuration type ${config}. Only the following values are supported : ${validConfigs.join("|")} `);
    else
        return config;
})();
const startApiServer = function* () {
    let proc;
    while (true)
        yield (() => __awaiter(this, void 0, void 0, function* () {
            if (proc) {
                exec_async_1.removeSpawnPrc("api");
                logKey = "main";
            }
            proc = exec_async_1.spawnVerbose("Starting Api Server", "api", `npm run start --prefix ${path_1.join(misc_1.rootRepo, "services", "api")}`, {
                env: {
                    PORT: process.env.API_PORT,
                    "postgres": (() => {
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
            yield exec_async_1.waitUntilVerbose("Api Server has been started", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    return (yield node_fetch_1.default("http://localhost:" + process.env.API_PORT)).ok;
                }
                catch (ex) {
                    return false;
                }
            }), { maxRetries: 10, retryInterval: 2000 });
            return proc;
        }))();
}();
const printHelp = (forceMain) => {
    const log = exec_async_1.logs[forceMain ? "main" : logKey];
    log.push("####################################################################\r\n");
    log.push("############################### HELP ###############################\r\n");
    log.push("####################################################################\r\n");
    log.push("~Available Logs - Type the name of a long and hit return to switch to it\r\n");
    log.push("~Commands\r\n");
    Object.keys(exec_async_1.logs).forEach((lk) => {
        log.push(lk + "\r\n");
    });
    log.push("~Commands\r\n");
    if (logKey === "api\r\n")
        log.push("(r)estart API Server\r\n");
    log.push("(h)elp\r\n");
    log.push("(q)uit\r\n");
    log.push("####################################################################\r\n");
};
const rl = readline_1.createInterface({
    input: process.stdin,
    output: process.stdout
});
let lastLogLength = 0;
let logKey = "main";
const keepReading = () => {
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
            const log = exec_async_1.logs[key];
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
setInterval(() => {
    const log = exec_async_1.logs[logKey];
    if (lastLogLength === 0)
        console.clear();
    if (lastLogLength !== log.length) {
        console.log(log.slice(lastLogLength, log.length).join(""));
        lastLogLength = log.length;
        process.stdout.write(">");
    }
}, 1000);
exec_async_1.logs.main.push(`Launching TradingPost App in mode:${"WEB"} with configuration:${config}`);
(() => __awaiter(void 0, void 0, void 0, function* () {
    exec_async_1.spawnVerbose("Starting Common Watcher...", "common", "npm run watch --prefix " + path_1.join(misc_1.rootRepo, "common"));
    yield exec_async_1.execVerboseAsync("Linking Api Server To Common...", "npm run link-common  --prefix " + path_1.join(misc_1.rootRepo, "services", "api"));
    yield startApiServer.next().value;
    yield exec_async_1.execVerboseAsync("Uninstall Common from TradingPost App", "npm uninstall @tradingpost/common");
    config === "TEST" ?
        yield exec_async_1.execVerboseAsync("Installing Common to TradingPost App", "npm install @tradingpost/common") :
        yield exec_async_1.execVerboseAsync("Linking Common to TradingPost App", "npm run link-common");
    yield exec_async_1.spawnVerbose("Starting TradingPost App", "app", "npm run web" + (config === "TEST" ? " --no-dev --minify" : ""));
    exec_async_1.logs.main.push("Trading Post App Has Started!!!!!");
    printHelp();
}))();
