"use strict";
exports.__esModule = true;
exports.ButtonGroup = void 0;
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var style_1 = require("../style");
var ButtonGroup = function (props) {
    return <components_1.ButtonGroup style={[{ width: "100%", marginBottom: style_1.sizes.rem1 }, props.style]}>
        {props.items.map(function (v, idx, arr) {
            var isSelected = props.value === v.value;
            var opacity = isSelected ? 1 : 0.5;
            //console.log(`Button at idx ${idx} isSelected: ${isSelected} with opacity of ${opacity}`);
            return <components_1.Button key={'button_' + idx + "_" + isSelected} style={[
                    {
                        backgroundColor: isSelected ? "green" : "#777",
                        width: 100 / arr.length + "%",
                        minWidth: 100 / arr.length + "%",
                        opacity: opacity
                    }, isSelected ? props.unselectedStyle : undefined
                ]} onPress={function () { return props.onValueChange(v.value); }}>
                        {function (evaProps) {
                    return <components_1.Text {...evaProps} style={{ color: 'white', fontSize: 14 }}>
                                {v.label}
                            </components_1.Text>;
                }}
                    </components_1.Button>;
        })}
    </components_1.ButtonGroup>;
};
exports.ButtonGroup = ButtonGroup;
