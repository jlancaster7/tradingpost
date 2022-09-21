"use strict";
exports.__esModule = true;
exports.Label = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
function Label(props) {
    return <components_1.Text style={{
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 7
        }}>{props.children}</components_1.Text>;
}
exports.Label = Label;
