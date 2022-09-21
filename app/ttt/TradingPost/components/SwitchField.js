"use strict";
exports.__esModule = true;
exports.SwitchField = void 0;
var react_1 = require("react");
var react_native_ui_lib_1 = require("react-native-ui-lib");
var LabeledField_1 = require("./LabeledField");
function SwitchField(props) {
    return <LabeledField_1.LabeledField compact={props.compact} label={props.label} leftElement={props.leftElement}><react_native_ui_lib_1.Switch {...props.switchProps}/></LabeledField_1.LabeledField>;
}
exports.SwitchField = SwitchField;
