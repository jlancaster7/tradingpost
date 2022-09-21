"use strict";
exports.__esModule = true;
exports.IconButton = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
function IconButton(props) {
    return <react_native_1.Image source={props.iconSource} resizeMode="contain" style={[{ height: 24 }, props.style]}/>;
}
exports.IconButton = IconButton;
