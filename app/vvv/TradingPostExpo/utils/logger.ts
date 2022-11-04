
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
    error,
    tryCatch
}
