//Should change this to a process.env
let enableVerbose = true;

const verbose = (msg: string) => {
    if (enableVerbose) {
        console.log(msg);
    }
}
const error = (err: string | Error | unknown) => {
    console.error(err);
}
const tryCatch = async <T>(action: () => T) => {
    try {
        return await action();
    } catch (ex) {
        error(ex)
    }
}

export const Log = {
    enableVerbose: (enabled: boolean) => {
        enableVerbose = enabled
    },
    verbose,
    error,
    tryCatch
}
