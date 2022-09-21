"use strict";
exports.__esModule = true;
exports.ButtonPanel = exports.ScrollWithButtons = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var Colors_1 = require("../constants/Colors");
var style_1 = require("../style");
var hooks_1 = require("../utils/hooks");
var PrimaryButton_1 = require("./PrimaryButton");
var SecondaryButton_1 = require("./SecondaryButton");
function ScrollWithButtons(props) {
    var isKeyboardVisible = (0, hooks_1.useIsKeyboardVisible)().isKeyboardVisible;
    return <react_native_1.View style={[style_1.flex,]}>
        <react_native_1.View style={[style_1.flex, { backgroundColor: Colors_1.AppColors.background }]}>
            <react_native_1.ScrollView nestedScrollEnabled contentContainerStyle={[{ maxHeight: "100%", height: props.fillHeight ? "100%" : undefined }]}>
                {/* This is here to force layout of the content. Seems like a but with enxted scrollview content */}
                {!isKeyboardVisible && <react_native_1.View style={{ height: 0 }}></react_native_1.View>}
                {props.children}
            </react_native_1.ScrollView>
        </react_native_1.View>
        {props.buttons && <ButtonPanel {...props.buttons}/>}
    </react_native_1.View>;
}
exports.ScrollWithButtons = ScrollWithButtons;
function ButtonPanel(props) {
    return <react_native_1.View style={[{ borderTopColor: "#ccc", borderTopWidth: 1, flexDirection: "row",
                paddingTop: 8,
                paddingBottom: 8,
                justifyContent: "space-evenly", zIndex: 1000 }]}>
        {props.left && <SecondaryButton_1.SecondaryButton style={{ width: "48%" }} onPress={props.left.onPress} disabled={props.locked}>{props.left.text}</SecondaryButton_1.SecondaryButton>}
        <PrimaryButton_1.PrimaryButton style={{ width: props.left ? "48%" : "96%" }} onPress={props.right.onPress} disabled={props.locked}>{props.right.text}</PrimaryButton_1.PrimaryButton>
    </react_native_1.View>;
}
exports.ButtonPanel = ButtonPanel;
