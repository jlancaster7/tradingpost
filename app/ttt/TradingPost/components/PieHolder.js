"use strict";
exports.__esModule = true;
exports.LineHolder = exports.PieHolder = exports.PieLabels = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
var grid_1 = require("../charts-js/grid");
var x_axis_1 = require("../charts-js/x-axis");
var y_axis_1 = require("../charts-js/y-axis");
var line_chart_1 = require("../charts/line-chart/line-chart");
;
var pie_chart_1 = require("../charts/pie-chart");
var style_1 = require("../style");
var data = [5, 10, 4, 6, 8];
var data2 = [1, 5, 3, 9.7, 2.3, 7];
function PieLabels(props) {
    var _a;
    return <>
        {(_a = props.slices) === null || _a === void 0 ? void 0 : _a.map(function (d) {
            return <react_native_svg_1.Text key={d.index} x={d.labelCentroid[0]} y={d.labelCentroid[1]} textAnchor={'middle'} alignmentBaseline={'center'} fontSize={14} stroke={'black'} strokeWidth={0.2}>
                {d.data.key}
            </react_native_svg_1.Text>;
            //
        })}
    </>;
}
exports.PieLabels = PieLabels;
function PieHolder() {
    return <pie_chart_1["default"] innerRadius={8} style={{ aspectRatio: 16 / 9 }} data={data.map(function (value, i) { return ({ value: value, onPress: function () { return react_native_1.Alert.alert("Value is " + value); }, key: "key_".concat(i), props: { fill: style_1.chartColors[i] } }); })}>
        <PieLabels key="LABELZ"/>
    </pie_chart_1["default"]>;
}
exports.PieHolder = PieHolder;
var LineHolder = function (props) {
    var lineData = [];
    var gridData;
    var xData;
    if (!props.data) {
        lineData = data2;
        gridData = data2;
        xData = data2;
    }
    else {
        lineData = props.data;
        gridData = lineData.map(function (a) { return a["return"]; });
        xData = lineData.map(function (a) { return new Date(a.date); });
    }
    console.log(gridData);
    var contentInset = { top: 5, bottom: 5, right: 5, left: 5 };
    return <react_native_1.View style={[style_1.row, { aspectRatio: 16 / 9, padding: style_1.sizes.rem0_5, borderWidth: 1, borderRadius: style_1.sizes.rem1, borderColor: "#ccc" }]}>
        
        <react_native_1.View style={{ width: style_1.sizes.rem1_5, height: "85%", marginRight: "3%" }}>
            <y_axis_1["default"] data={gridData} style={{ width: "100%", height: "100%", flex: 1 }} svg={{
            fill: 'grey',
            fontSize: 10
        }} numberOfTicks={10} contentInset={contentInset} 
    //yAccessor={(value: any)=> value - value % 1}
    formatLabel={function (value) { return "$".concat(value.toFixed(2)); }}/>
*/        </react_native_1.View>
            
        <react_native_1.View style={{ flex: 1, height: "100%" }}>
            <line_chart_1["default"] svg={{ stroke: "blue" }} style={{ flex: 1 }} data={gridData} 
    //numberOfTicks={10}
    contentInset={contentInset}>
                
                <grid_1["default"] direction={undefined}/>
            </line_chart_1["default"]>
            
            <x_axis_1["default"] data={gridData} style={{ height: style_1.sizes.rem1, width: "98%" }} svg={{
            fill: 'grey',
            fontSize: 10
        }} contentInset={contentInset} 
    //min={xData[0]}
    //max={xData[xData.length - 1]}
    //xAccessor={( index: any ) => index}
    numberOfTicks={10}/>
        </react_native_1.View>
            
    </react_native_1.View>;
};
exports.LineHolder = LineHolder;
