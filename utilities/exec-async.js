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
exports.waitUntilVerbose = exports.waitUntil = exports.removeSpawnPrc = exports.spawnVerbose = exports.spawnCmd = exports.procs = exports.logs = exports.execVerboseAsync = exports.execAsync = void 0;
const child_process_1 = require("child_process");
const terminate_1 = __importDefault(require("terminate"));
//function Cleanup(callback) {
// attach user callback to the process event emitter
// if no callback, it will still exit gracefully on Ctrl-C
//callback = callback || noOp;
process.on('cleanup', () => {
    console.log("I hit cleanup");
    cleanAllProcs();
});
const cleanAllProcs = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const k of Object.keys(exports.procs)) {
        console.log("Killing.... " + k);
        const proc = exports.procs[k];
        if (proc.pid) {
            terminate_1.default(proc.pid, function (err) {
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
});
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
const execAsync = (cmd, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { err, stderr, stdout } = yield new Promise((resolve, reject) => {
        try {
            exports.logs.main.push(`Exec Async: ${cmd}` + "\r\n");
            const proc = child_process_1.exec(cmd, options, (err, stdout, stderr) => {
                resolve({
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                });
            });
        }
        catch (ex) {
            reject(ex);
        }
    });
    if (stderr) {
        const errorMessage = typeof stderr === "string" ? stderr : stderr.toString('utf8');
        exports.logs.main.push("######## STDERR #########" + "\r\n");
        exports.logs.main.push(errorMessage) + "\r\n";
        exports.logs.main.push("######## EOF STDERR #########" + "\r\n");
        //throw new Error(errorMessage)
    }
    const output = typeof stdout === "string" ? stdout : stdout.toString('utf8');
    exports.logs.main.push(output + "\r\n");
    if (err)
        throw err;
    return output;
});
exports.execAsync = execAsync;
const execVerboseAsync = (message, ...prms) => __awaiter(void 0, void 0, void 0, function* () {
    exports.logs.main.push(message + "\r\n");
    yield exports.execAsync(prms[0], prms[1]);
});
exports.execVerboseAsync = execVerboseAsync;
exports.logs = {
    main: []
};
exports.procs = {};
const clearCharacter = "c";
const spawnCmd = (prefix, cmd, options) => {
    var _a, _b;
    if (exports.logs[prefix])
        throw new Error("Prefix is already taken. Please use another.");
    const log = (exports.logs[prefix] = []);
    log.push(`${prefix}^>${cmd}`);
    const finalOPtions = Object.assign({ detached: true, shell: true }, options);
    const proc = exports.procs[prefix] =
        child_process_1.spawn(cmd, finalOPtions || {});
    console.log("Starting Spawn with pid of :::" + proc.pid);
    //const proc = spawn("tsc",["-w", "C:\\Users\\lever\\Documents\\Hive\\repo\\common"] ,finalOPtions||{});
    (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (d) => {
        //if (d !== clearCharacter) {
        log.push(`${prefix}::>${d}`);
        //}
    });
    (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
        log.push(`${prefix}!!>${data}`);
    });
    // proc.on("error", (msg) => {
    //     console.error(msg);
    // })
    proc.on('close', (code) => {
        log.push(`${prefix}$>${code}`);
    });
    return proc;
};
exports.spawnCmd = spawnCmd;
const spawnVerbose = (message, ...prms) => {
    exports.logs.main.push(message + "\r\n");
    return exports.spawnCmd(prms[0], prms[1], prms[2]);
};
exports.spawnVerbose = spawnVerbose;
const removeSpawnPrc = (key) => {
    delete exports.logs[key];
    const proc = exports.procs[key];
    if (proc)
        proc.kill();
};
exports.removeSpawnPrc = removeSpawnPrc;
const waitUntil = (test, settings) => __awaiter(void 0, void 0, void 0, function* () {
    let _settings = settings || {};
    _settings.maxRetries = _settings.maxRetries || Number.MAX_SAFE_INTEGER;
    _settings.retryInterval = _settings.retryInterval || 1000;
    let numberOfTries = -1;
    while (numberOfTries <= _settings.maxRetries && !(yield test({ numberOfTries: ++numberOfTries }))) { }
});
exports.waitUntil = waitUntil;
const waitUntilVerbose = (message, ...prms) => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.waitUntil(prms[0], prms[1]);
    exports.logs.main.push(message + "\r\n");
});
exports.waitUntilVerbose = waitUntilVerbose;
