"use strict";
var ErrorCodes = {
    VALIDATION_ERROR: "VALIDATION_ERROR"
};
var ErrorMessages = {
    VALIDATION_ERROR: "Error validating request"
};
var makeError = function (type, data) {
    return {
        code: ErrorCodes.VALIDATION_ERROR,
        message: ErrorMessages.VALIDATION_ERROR,
        data: data
    };
};
