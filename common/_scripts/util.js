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
Object.defineProperty(exports, "__esModule", { value: true });
exports.execAsync = void 0;
const child_process_1 = require("child_process");
const execAsync = (cmd, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { err, stderr, stdout } = yield new Promise((resolve, reject) => {
        try {
            console.log(`Exec Async: ${cmd}`);
            child_process_1.exec(cmd, options, (err, stdout, stderr) => {
                console.log("Resolved one time...");
                resolve({
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                });
            });
        }
        catch (ex) {
            console.log("Reject one time...");
            reject(ex);
        }
    });
    if (err)
        throw err;
    if (stderr) {
        const errorMessage = typeof stderr === "string" ? stderr : stderr.toString('utf8');
        console.log("######## STDERR #########");
        console.warn(errorMessage);
        console.log("######## EOF STDERR #########");
        //throw new Error(errorMessage)
    }
    const output = typeof stdout === "string" ? stdout : stdout.toString('utf8');
    console.log(output);
    return output;
});
exports.execAsync = execAsync;
