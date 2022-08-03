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
            (0, child_process_1.exec)(cmd, options, (err, stdout, stderr) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW9DO0FBQzdCLE1BQU0sU0FBUyxHQUFHLENBQU8sR0FBVyxFQUFFLE9BRTVDLEVBQUUsRUFBRTtJQUNELE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbEUsSUFBSTtZQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLElBQUEsb0JBQUksRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLENBQUM7b0JBQ0osR0FBRyxFQUFFLEdBQUc7b0JBQ1IsTUFBTSxFQUFFLE1BQU07b0JBQ2QsTUFBTSxFQUFFLE1BQU07aUJBQ2pCLENBQUMsQ0FBQTtZQUNOLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLEVBQUUsRUFBRTtZQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDZDtJQUNMLENBQUMsQ0FBQyxDQUFBO0lBR0YsSUFBSSxHQUFHO1FBQ0gsTUFBTSxHQUFHLENBQUM7SUFFZCxJQUFJLE1BQU0sRUFBRTtRQUNSLE1BQU0sWUFBWSxHQUFHLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUM3QywrQkFBK0I7S0FDbEM7SUFDRCxNQUFNLE1BQU0sR0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3RSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQSxDQUFBO0FBbkNZLFFBQUEsU0FBUyxhQW1DckIifQ==