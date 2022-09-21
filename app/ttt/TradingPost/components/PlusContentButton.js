"use strict";
exports.__esModule = true;
exports.PlusContentButton = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var style_1 = require("../style");
var IconfiyIcon_1 = require("./IconfiyIcon");
var plus_circle_1 = require("@iconify/icons-mdi/plus-circle");
/**
 * This component assumes it will be placed in the bottom right corner of its parent.
 * @param props
 * @returns
 */
var PlusContentButton = function (props) {
    return <react_native_1.Pressable style={[style_1.shadow, {
                position: "absolute",
                bottom: 10,
                right: 10,
                backgroundColor: "blue",
                height: 64, aspectRatio: 1,
                borderRadius: 32,
                overflow: "hidden"
            }]} onPress={props.onPress}>
        <IconfiyIcon_1.IconifyIcon icon={plus_circle_1["default"]} currentColor="green" style={{ height: 64, width: 64, aspectRatio: 1, margin: 0, padding: 0, backgroundColor: "white" }} svgProps={{
            style: {
                height: 64 * 1.2,
                width: 64 * 1.2,
                marginTop: "-10%",
                marginLeft: "-10%"
            }
        }}/>
    </react_native_1.Pressable>;
};
exports.PlusContentButton = PlusContentButton;
