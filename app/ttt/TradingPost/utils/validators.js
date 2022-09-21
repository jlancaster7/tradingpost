"use strict";
exports.__esModule = true;
exports.isAlphaNumeric = exports.isRequired = exports.isValidEmail = void 0;
function isValidEmail(email) {
    return /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/.test(email || "");
}
exports.isValidEmail = isValidEmail;
function isRequired(value) {
    return (value || "").replace(/ /gi, '').length > 0;
}
exports.isRequired = isRequired;
function isAlphaNumeric(value) {
    return /^[a-z0-9\_]+$/i.test(value || "");
}
exports.isAlphaNumeric = isAlphaNumeric;
