export function isValidEmail(email: string | undefined) {
    return /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/.test(email || "")
}

export function isRequired(value: string | undefined) {
    return (value || "").replace(/ /gi, '').length > 0;
}

export function isAlphaNumeric(value: string | undefined) {
    return /^[a-z0-9\_]+$/i.test(value || "")
}

export function isNotUndefinedOrNull(value: any): boolean {
    if (value === undefined) return false;
    if (value === null) return false;
    return true;
}