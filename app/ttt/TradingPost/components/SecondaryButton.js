"use strict";
exports.__esModule = true;
exports.AltSecondaryButton = exports.SecondaryButton = void 0;
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
function SecondaryButton(props) {
    return <components_1.Button status={'success'} {...props}/>;
}
exports.SecondaryButton = SecondaryButton;
function AltSecondaryButton(props) {
    return <components_1.Button status={'success'} {...props}/>;
}
exports.AltSecondaryButton = AltSecondaryButton;
