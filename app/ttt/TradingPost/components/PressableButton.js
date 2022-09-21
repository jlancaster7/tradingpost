"use strict";
exports.__esModule = true;
exports.PressableButton = void 0;
var react_native_1 = require("react-native");
var Colors_1 = require("../constants/Colors");
var PressableButton = function (props) {
    var bgColor = (props.backgroundColor || Colors_1.AppColors.primary);
    return <react_native_1.Pressable style={{
            backgroundColor: props.outline ? "#00000000" : bgColor,
            borderColor: props.outline ? props.color : (props.backgroundColor || Colors_1.AppColors.primary)
        }} 
    // backgroundColor={Colors.secondary}
    // color={Colors.white}
    {...props}><react_native_1.Text style={{ color: props.color || "#ffffff" }}>{props.title}</react_native_1.Text></react_native_1.Pressable>;
};
exports.PressableButton = PressableButton;
