"use strict";
exports.__esModule = true;
exports.LabeledField = void 0;
var react_1 = require("react");
var style_1 = require("../style");
var components_1 = require("@ui-kitten/components");
var react_native_1 = require("react-native");
function LabeledField(props) {
    var sz = props.compact ? style_1.sizes.rem1 : style_1.sizes.rem2;
    return <react_native_1.View style={[style_1.row, { alignItems: "center", marginBottom: sz }]}>
        {props.leftElement && props.leftElement({ height: sz, width: sz })}
        <components_1.Text style={[style_1.flex, { fontSize: props.compact ? style_1.fonts.small : style_1.fonts.medium }]}>{props.label}</components_1.Text>
        {props.children}
    </react_native_1.View>;
}
exports.LabeledField = LabeledField;
