const ErrorCodes = {
    VALIDATION_ERROR: "VALIDATION_ERROR"
}

const ErrorMessages: Record<keyof typeof ErrorCodes, string> = {
    VALIDATION_ERROR: "Error validating request"
}

export const makeError = (type: keyof typeof ErrorCodes, data: any) => {
    return {
        code: ErrorCodes.VALIDATION_ERROR,
        message: ErrorMessages.VALIDATION_ERROR,
        data
    }
}