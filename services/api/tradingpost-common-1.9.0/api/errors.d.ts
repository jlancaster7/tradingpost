declare const ErrorCodes: {
    VALIDATION_ERROR: string;
};
export declare const makeError: (type: keyof typeof ErrorCodes, data: any) => {
    code: string;
    message: string;
    data: any;
};
export {};
