"use strict";
exports.__esModule = true;
exports.OverlayScreen = void 0;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var style_1 = require("../style");
var OverlayScreen = function () {
    var nav = (0, native_1.useNavigation)();
    return <react_native_1.View style={[style_1.flex, { justifyContent: "center" }]}>
        <react_native_1.Pressable onPress={function () {
            nav.goBack();
        }} style={{ backgroundColor: "white", opacity: 0.85, position: "absolute", height: "100%", width: "100%" }}></react_native_1.Pressable>
        <react_native_1.View style={{ margin: style_1.sizes.rem1, padding: style_1.sizes.rem1, backgroundColor: "orange" }}>
            <react_native_1.Text>
                test
            </react_native_1.Text>
        </react_native_1.View>
    </react_native_1.View>;
};
exports.OverlayScreen = OverlayScreen;
