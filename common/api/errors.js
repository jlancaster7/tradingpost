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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sVUFBVSxHQUFHO0lBQ2YsZ0JBQWdCLEVBQUUsa0JBQWtCO0NBQ3ZDLENBQUE7QUFFRCxNQUFNLGFBQWEsR0FBNEM7SUFDM0QsZ0JBQWdCLEVBQUUsMEJBQTBCO0NBQy9DLENBQUE7QUFFTSxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQTZCLEVBQUUsSUFBUyxFQUFFLEVBQUU7SUFDbEUsT0FBTztRQUNILElBQUksRUFBRSxVQUFVLENBQUMsZ0JBQWdCO1FBQ2pDLE9BQU8sRUFBRSxhQUFhLENBQUMsZ0JBQWdCO1FBQ3ZDLElBQUk7S0FDUCxDQUFBO0FBQ0wsQ0FBQyxDQUFBO0FBTlksUUFBQSxTQUFTLGFBTXJCIn0=