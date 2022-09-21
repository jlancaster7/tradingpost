"use strict";
exports.__esModule = true;
exports.LineChart = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var grid_1 = require("../charts-js/grid");
var x_axis_1 = require("../charts-js/x-axis");
var y_axis_1 = require("../charts-js/y-axis");
var line_chart_1 = require("../charts/line-chart/line-chart");
var style_1 = require("../style");
var LineChart = function (props) {
    return <react_native_1.View style={[style_1.row, { aspectRatio: 16 / 9, padding: style_1.sizes.rem1, borderWidth: 1, borderRadius: style_1.sizes.rem1 / 4, borderColor: "#ccc" }]}>
        <react_native_1.View style={{ width: style_1.sizes.rem1, height: "100%" }}>
            <y_axis_1["default"] data={props.data} style={{ width: "100%", flex: 1 }} svg={{
            fill: 'grey',
            fontSize: 10
        }}/>
            <react_native_1.View style={{ width: "100%", height: style_1.sizes.rem1 }}></react_native_1.View>
        </react_native_1.View>
        <react_native_1.View style={{ flex: 1, height: "100%" }}>
            <line_chart_1["default"] svg={{ stroke: "blue" }} style={{ flex: 1 }} data={props.data} yAccessor={undefined}>
                <grid_1["default"] />
            </line_chart_1["default"]>
            <x_axis_1["default"] data={props.data} style={{ height: style_1.sizes.rem1, width: "100%" }} svg={{
            fill: 'grey',
            fontSize: 10
        }}/>
        </react_native_1.View>
    </react_native_1.View>;
};
exports.LineChart = LineChart;
