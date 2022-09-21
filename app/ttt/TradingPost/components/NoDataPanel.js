"use strict";
exports.__esModule = true;
exports.NoDataPanel = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
var react_native_1 = require("react-native");
var style_1 = require("../style");
function NoDataPanel(props) {
    return <react_native_1.View style={[style_1.flex, { justifyContent: "center", alignContent: "center" }]}>
        <components_1.Text style={{ fontSize: style_1.fonts.large, color: "lightgray", textAlign: "center" }}>
            {props.message || "No Items"}
        </components_1.Text>
    </react_native_1.View>;
}
exports.NoDataPanel = NoDataPanel;
