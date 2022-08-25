import { ChildProcess, exec, spawn, SpawnOptions } from 'child_process'
import terminate from 'terminate';

type ExecParams = Parameters<typeof exec>
type SpawnParams = Parameters<typeof spawn>


//function Cleanup(callback) {

// attach user callback to the process event emitter
// if no callback, it will still exit gracefully on Ctrl-C
//callback = callback || noOp;
process.on('cleanup', () => {
    console.log("I hit cleanup");
    cleanAllProcs();
});
const cleanAllProcs = async () => {
    for (const k of Object.keys(procs)) {
        console.log("Killing.... " + k);
        const proc = procs[k];
        if (proc.pid) {
            terminate(proc.pid, function (err: any) {

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
}

// do app specific cleaning before exiting
process.on('exit', function () {
    console.log("Cleaning Up....Magic")
    process.emit("cleanup" as any);
});

// catch ctrl+c event and exit normally
process.on('SIGINT', function () {
    console.log('Ctrl-C...');
    process.exit(2)
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

export const execAsync = async (cmd: ExecParams[0], options?: ExecParams[1]) => {
    const { err, stderr, stdout } = await new Promise((resolve, reject) => {
        try {
            logs.main.push(`Exec Async: ${cmd}` + "\r\n");
            const proc = exec(cmd, options, (err, stdout, stderr) => {
                resolve({
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                })
            });
        }
        catch (ex) {
            reject(ex);
        }
    })

    if (stderr) {
        const errorMessage = typeof stderr === "string" ? stderr : stderr.toString('utf8')
        logs.main.push("######## STDERR #########" + "\r\n");
        logs.main.push(errorMessage) + "\r\n";
        logs.main.push("######## EOF STDERR #########" + "\r\n");
        //throw new Error(errorMessage)
    }
    const output = typeof stdout === "string" ? stdout : stdout.toString('utf8');
    logs.main.push(output + "\r\n");
    if (err)
        throw err;

    return output;
}
export const execVerboseAsync = async (message: string, ...prms: Parameters<typeof execAsync>) => {
    logs.main.push(message + "\r\n");
    await execAsync(prms[0], prms[1]);
}

export const logs: Record<string, string[]> = {
    main: []
}
export const procs: Record<string, ChildProcess> = {}
const clearCharacter = "c";
export const spawnCmd = (prefix: string, cmd: SpawnParams[0], options?: SpawnOptions) => {

    if (logs[prefix])
        throw new Error("Prefix is already taken. Please use another.")

    const log: string[] = (logs[prefix] = []);

    log.push(`${prefix}^>${cmd}`);
    const finalOPtions = {
        detached: true,
        shell: true,
        
        ...options,
        //env: {
        //...options?.env,
        //PATH: process.env.PATH
        //}
    } as SpawnOptions;

    const proc =
        procs[prefix] =
        spawn(cmd, finalOPtions || {});
    console.log("Starting Spawn with pid of :::" + proc.pid);
    //const proc = spawn("tsc",["-w", "C:\\Users\\lever\\Documents\\Hive\\repo\\common"] ,finalOPtions||{});
    proc.stdout?.on("data", (d) => {
        //if (d !== clearCharacter) {
        log.push(`${prefix}::>${d}`);
        //}
    });
    proc.stderr?.on('data', (data) => {
        log.push(`${prefix}!!>${data}`);
    });
    // proc.on("error", (msg) => {
    //     console.error(msg);
    // })
    proc.on('close', (code) => {
        log.push(`${prefix}$>${code}`);
    });
    return proc;
}
export const spawnVerbose = (message: string, ...prms: Parameters<typeof spawnCmd>) => {
    logs.main.push(message + "\r\n");
    return spawnCmd(prms[0], prms[1], prms[2]);
}

export const removeSpawnPrc = (key: string) => {
    delete logs[key];
    const proc = procs[key];
    if (proc)
        proc.kill();

}

export const waitUntil = async (test: (data: { numberOfTries: number }) => Promise<boolean>, settings?: {
    retryInterval?: number,
    maxRetries?: number
}) => {
    let _settings = settings || {}
    _settings.maxRetries = _settings.maxRetries || Number.MAX_SAFE_INTEGER;
    _settings.retryInterval = _settings.retryInterval || 1000;

    let numberOfTries = -1;
    while (numberOfTries <= _settings.maxRetries && !await test({ numberOfTries: ++numberOfTries })) { }
}
export const waitUntilVerbose = async (message: string, ...prms: Parameters<typeof waitUntil>) => {
    await waitUntil(prms[0], prms[1]);
    logs.main.push(message + "\r\n");
}