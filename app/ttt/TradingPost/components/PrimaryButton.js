"use strict";
exports.__esModule = true;
exports.AltPrimaryButton = exports.PrimaryButton = void 0;
var react_1 = require("react");
//import { ButtonProps } from "react-native-ui-lib";
var components_1 = require("@ui-kitten/components");
//import Button from "react-native-ui-lib/button";
function PrimaryButton(props) {
    return <components_1.Button 
    //backgroundColor={Colors.primary} 
    {...props}/>;
}
exports.PrimaryButton = PrimaryButton;
function AltPrimaryButton(props) {
    return <components_1.Button 
    //backgroundColor={Colors.white} 
    //color={AppColors.primary}
    // outlineColor={AppColors.primary}
    {...props}/>;
}
exports.AltPrimaryButton = AltPrimaryButton;
