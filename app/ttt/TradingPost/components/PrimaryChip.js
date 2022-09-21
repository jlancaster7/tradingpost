"use strict";
exports.__esModule = true;
exports.PrimaryChip = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
var Colors_1 = require("../constants/Colors");
var style_1 = require("../style");
var react_native_1 = require("react-native");
function PrimaryChip(props) {
    var color = props.isAlt ? Colors_1.AppColors.secondary : Colors_1.AppColors.primary;
    return <components_1.Button key={props.label} style={[{ borderRadius: 16, backgroundColor: color, borderColor: color, marginRight: style_1.sizes.rem1 / 4, height: style_1.sizes.rem2, minHeight: style_1.sizes.rem2 }, props.style]}><react_native_1.Text numberOfLines={1} style={{ color: "white" }}>{props.label}</react_native_1.Text></components_1.Button>;
}
exports.PrimaryChip = PrimaryChip;
