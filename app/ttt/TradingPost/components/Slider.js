"use strict";
exports.__esModule = true;
exports.Slider = void 0;
var react_1 = require("react");
var react_native_multi_slider_1 = require("@ptomasroos/react-native-multi-slider");
function Slider(props) {
    return <react_native_multi_slider_1["default"] 
    //thumbTintColor={Colors.primary}
    //maximumTrackTintColor={Colors.grey50}
    //minimumTrackTintColor={Colors.grey50} 
    {...props}/>;
}
exports.Slider = Slider;
