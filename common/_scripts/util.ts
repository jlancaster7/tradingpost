import { exec } from 'child_process'
export const execAsync = async (cmd: string, options?: {
    env?: NodeJS.ProcessEnv
}) => {
    const { err, stderr, stdout } = await new Promise((resolve, reject) => {
        try {
            console.log(`Exec Async: ${cmd}`);
            exec(cmd, options, (err, stdout, stderr) => {
                console.log("Resolved one time...");
                resolve({
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                })
            });
        }
        catch (ex) {
            console.log("Reject one time...");
            reject(ex);
        }
    })


    if (err)
        throw err;

    if (stderr) {
        const errorMessage = typeof stderr === "string" ? stderr : stderr.toString('utf8')
        console.log("######## STDERR #########");
        console.warn(errorMessage);
        console.log("######## EOF STDERR #########");
        //throw new Error(errorMessage)
    }
    const output = typeof stdout === "string" ? stdout : stdout.toString('utf8');
    console.log(output);
    return output;
}