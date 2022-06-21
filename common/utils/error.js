"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = void 0;
exports.getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    return String(error);
};
