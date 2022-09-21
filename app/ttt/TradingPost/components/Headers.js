"use strict";
exports.__esModule = true;
exports.Subheader = exports.Header = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
var style_1 = require("../style");
var Colors_1 = require("../constants/Colors");
function Header(props) {
    return <components_1.Text style={[{ color: Colors_1.AppColors.primary, fontSize: style_1.fonts.large, marginBottom: 8 }, props.style]}>{props.text}</components_1.Text>;
}
exports.Header = Header;
function Subheader(props) {
    return <components_1.Text 
    //color={Colors.primary}
    style={[{ color: Colors_1.AppColors.secondary, fontSize: style_1.fonts.small, marginBottom: 8 }, props.style]}>{props.text}</components_1.Text>;
}
exports.Subheader = Subheader;
