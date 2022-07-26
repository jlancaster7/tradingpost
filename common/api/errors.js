"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeError = void 0;
const ErrorCodes = {
    VALIDATION_ERROR: "VALIDATION_ERROR"
};
const ErrorMessages = {
    VALIDATION_ERROR: "Error validating request"
};
const makeError = (type, data) => {
    return {
        code: ErrorCodes.VALIDATION_ERROR,
        message: ErrorMessages.VALIDATION_ERROR,
        data
    };
};
exports.makeError = makeError;
