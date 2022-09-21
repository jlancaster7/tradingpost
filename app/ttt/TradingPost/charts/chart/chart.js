"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Chart = void 0;
var array = require("d3-array");
var scale = require("d3-scale");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
function Chart(props) {
    // Chart.defaultProps = {
    //     svg: {},
    //     width: 100,
    //     height: 100,
    //     curve: shape.curveLinear,
    //     contentInset: {},
    //     numberOfTicks: 10,
    //     xScale: scale.scaleLinear,
    //     yScale: scale.scaleLinear,
    //     xAccessor: ({ index }) => index,
    //     yAccessor: ({ item }) => item,
    // }
    var data = props.data, _a = props.xAccessor, xAccessor = _a === void 0 ? function (_a) {
        var item = _a.item, index = _a.index;
        return index;
    } : _a, yAccessor = props.yAccessor, _b = props.yScale, yScale = _b === void 0 ? scale.scaleLinear : _b, _c = props.xScale, xScale = _c === void 0 ? scale.scaleLinear : _c, style = props.style, animate = props.animate, animationDuration = props.animationDuration, _d = props.numberOfTicks, numberOfTicks = _d === void 0 ? 10 : _d, _e = props.contentInset, contentInset = _e === void 0 ? { top: 0, bottom: 0, left: 0, right: 0 } : _e, gridMax = props.gridMax, gridMin = props.gridMin, clampX = props.clampX, clampY = props.clampY, svg = props.svg, children = props.children, createPaths = props.createPaths;
    var top = contentInset.top, bottom = contentInset.bottom, left = contentInset.left, right = contentInset.right;
    var _f = (0, react_1.useState)(100), width = _f[0], setWidth = _f[1], _g = (0, react_1.useState)(100), height = _g[0], setHeight = _g[1];
    if (data.length === 0) {
        return <react_native_1.View style={style}/>;
    }
    var mappedData = data.map(function (item, index) { return ({
        y: yAccessor ? yAccessor({ item: item, index: index }) : item,
        x: xAccessor({ item: item, index: index })
    }); });
    var yValues = mappedData.map(function (item) { return item.y; });
    var xValues = mappedData.map(function (item) { return item.x; });
    var yExtent = array.extent(__spreadArray([], yValues, true));
    var xExtent = array.extent(__spreadArray([], xValues, true));
    var _h = props.yMin, yMin = _h === void 0 ? yExtent[0] || 0 : _h, _j = props.yMax, yMax = _j === void 0 ? yExtent[1] || 0 : _j, _k = props.xMin, xMin = _k === void 0 ? xExtent[0] || 0 : _k, _l = props.xMax, xMax = _l === void 0 ? xExtent[1] || 0 : _l;
    //invert range to support svg coordinate system
    var y = yScale()
        .domain([yMin, yMax])
        .range([height - bottom, top])
        .clamp(clampY || false);
    var x = xScale()
        .domain([xMin, xMax])
        .range([left, width - right])
        .clamp(clampX || false);
    var paths = createPaths({
        data: mappedData,
        x: x,
        y: y
    });
    var ticks = y.ticks(numberOfTicks);
    var extraProps = __assign({ x: x, y: y, data: data, ticks: ticks, width: width, height: height }, paths);
    //console.log(`SIZE IS : ${width},${height}`);
    //console.log(paths.path);
    return (<react_native_1.View style={style}>
            <react_native_1.View style={{ flex: 1 }} onLayout={function (event) {
            var _a = event.nativeEvent.layout, height = _a.height, width = _a.width;
            console.log("LAYING OUT");
            setHeight(height);
            setWidth(width);
        }}>
                {height > 0 && width > 0 && (<react_native_svg_1["default"] style={{ height: height, width: width }}>
                        {react_1["default"].Children.map(children, function (child) {
                if (child && child.props.belowChart) {
                    return react_1["default"].cloneElement(child, extraProps);
                }
                return null;
            })}
                        <react_native_svg_1.Path fill={'none'} {...svg} d={paths.path || undefined}/>
                        {react_1["default"].Children.map(children, function (child) {
                if (child && !child.props.belowChart) {
                    return react_1["default"].cloneElement(child, extraProps);
                }
                return null;
            })}
                    </react_native_svg_1["default"]>)}
            </react_native_1.View>
        </react_native_1.View>);
}
exports.Chart = Chart;
exports["default"] = Chart;
