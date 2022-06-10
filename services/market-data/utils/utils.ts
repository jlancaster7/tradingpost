export const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return String(error);
}

export const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}