"use strict";
exports.__esModule = true;
exports.Link = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var Colors_1 = require("../constants/Colors");
//import { Colors, Text, TextProps, TouchableOpacity, TouchableOpacityProps } from 'react-native-ui-lib'
function Link(props) {
    return <react_native_1.Pressable onPress={props.onPress}>
        <react_native_1.Text style={[{ color: Colors_1.AppColors.primary }, props.style]}>{props.children}</react_native_1.Text>
    </react_native_1.Pressable>;
}
exports.Link = Link;
