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
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
var shape = require("d3-shape");
var react_native_svg_1 = require("react-native-svg");
// class PieChart_OLD extends PureComponent {
//     state = {
//         height: 0,
//         width: 0,
//     }
//     _onLayout(event) {
//         const {
//             nativeEvent: {
//                 layout: { height, width },
//             },
//         } = event
//         this.setState({ height, width })
//     }
//     _calculateRadius(arg, max, defaultVal) {
//         if (typeof arg === 'string') {
//             return (arg.split('%')[0] / 100) * max
//         } else if (arg) {
//             return arg
//         } else {
//             return defaultVal
//         }
//     }
//     render() {
//         const {
//             data,
//             dataPoints,
//             innerRadius,
//             outerRadius,
//             labelRadius,
//             padAngle,
//             animate,
//             animationDuration,
//             style,
//             sort,
//             valueAccessor,
//             children,
//             startAngle,
//             endAngle,
//         } = this.props
//         const { height, width } = this.state
//         if (!data && dataPoints) {
//             throw `"dataPoints" have been renamed to "data" to better reflect the fact that it's an array of objects`
//         }
//         if (data.length === 0) {
//             return <View style={ style } />
//         }
//         const maxRadius = Math.min(width, height) / 2
//         if (Math.min(...data.map((obj) => valueAccessor({ item: obj }))) < 0) {
//             console.error("don't pass negative numbers to pie-chart, it makes no sense!")
//         }
//         const _outerRadius = this._calculateRadius(outerRadius, maxRadius, maxRadius)
//         const _innerRadius = this._calculateRadius(innerRadius, maxRadius, 0)
//         const _labelRadius = this._calculateRadius(labelRadius, maxRadius, _outerRadius)
//         if (outerRadius > 0 && _innerRadius >= outerRadius) {
//             console.warn('innerRadius is equal to or greater than outerRadius')
//         }
//         const arcs = data.map((item) => {
//             const arc = shape
//                 .arc()
//                 .outerRadius(_outerRadius)
//                 .innerRadius(_innerRadius)
//                 .padAngle(padAngle) // Angle between sections
//             item.arc &&
//                 Object.entries(item.arc).forEach(([key, value]) => {
//                     if (typeof arc[key] === 'function') {
//                         if (typeof value === 'string') {
//                             arc[key]((value.split('%')[0] / 100) * _outerRadius)
//                         } else {
//                             arc[key](value)
//                         }
//                     }
//                 })
//             return arc
//         })
//         const labelArcs = data.map((item, index) => {
//             if (labelRadius) {
//                 return shape
//                     .arc()
//                     .outerRadius(_labelRadius)
//                     .innerRadius(_labelRadius)
//                     .padAngle(padAngle)
//             }
//             return arcs[index]
//         })
//         const pieSlices = shape
//             .pie()
//             .value((d) => valueAccessor({ item: d }))
//             .sort(sort)
//             .startAngle(startAngle)
//             .endAngle(endAngle)(data)
//         const slices = pieSlices.map((slice, index) => ({
//             ...slice,
//             pieCentroid: arcs[index].centroid(slice),
//             labelCentroid: labelArcs[index].centroid(slice),
//         }))
//         const extraProps = {
//             width,
//             height,
//             data,
//             slices,
//         }
//         return (
//             <View pointerEvents= { 'box-none'} style = { style } >
//                 <View pointerEvents={ 'box-none' } style = {{ flex: 1 }
//     } onLayout = {(event) => this._onLayout(event)}>
//         { height > 0 && width > 0 && (
//             <Svg pointerEvents={ Platform.OS === 'android' && 'box-none' } style = {{ height, width }}>
//                 {/* center the progress circle*/ }
//                 < G x = { width / 2} y = { height / 2}>
//                 {
//                     React.Children.map(children, (child) => {
//                         if (child && child.props.belowChart) {
//                             return React.cloneElement(child, extraProps)
//                         }
//                         return null
//                     })
//                 }
// {
//     pieSlices.map((slice, index) => {
//         const { key, onPress, svg } = data[index]
//         return (
//             <Path
//                                             key= { key }
//         onPress = { onPress }
//         {...svg}
// d = { arcs[index](slice) }
// animate = { animate }
// animationDuration = { animationDuration }
//     />
//                                     )
//                                 })}
// {
//     React.Children.map(children, (child) => {
//         if (child && !child.props.belowChart) {
//             return React.cloneElement(child, extraProps)
//         }
//         return null
//     })
// }
// </G>
//     < /Svg>
//                     )}
// </View>
//     < /View>
//         )
//     }
// }
// PieChart.propTypes = {
//     data: PropTypes.arrayOf(
//         PropTypes.shape({
//             svg: PropTypes.object,
//             key: PropTypes.any.isRequired,
//             value: PropTypes.number,
//             arc: PropTypes.object,
//         })
//     ).isRequired,
//     innerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//     outerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//     labelRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//     padAngle: PropTypes.number,
//     animate: PropTypes.bool,
//     animationDuration: PropTypes.number,
//     style: PropTypes.any,
//     sort: PropTypes.func,
//     valueAccessor: PropTypes.func,
// }
// PieChart.defaultProps = {
//     width: 100,
//     height: 100,
//     padAngle: 0.05,
//     startAngle: 0,
//     endAngle: Math.PI * 2,
//     valueAccessor: ({ item }) => item.value,
//     innerRadius: '50%',
//     sort: (a, b) => b.value - a.value,
// }
//export default PieChart
function _calculateRadius(arg, max, defaultVal) {
    if (typeof arg === 'string') {
        return (Number(arg.split('%')[0]) / 100) * max;
    }
    else if (arg) {
        return arg;
    }
    else {
        return defaultVal;
    }
}
function PieChart(props) {
    var padAngle = props.padAngle || 0.05;
    var startAngle = props.startAngle || 0;
    var endAngle = props.endAngle || Math.PI * 2;
    var valueAccessor = props.valueAccessor || (function (item) { return item.value; });
    var innerRadius = props.innerRadius || '50%';
    var sort = props.sort || (function (a, b) { return b.value - a.value; });
    var data = props.data, style = props.style, outerRadius = props.outerRadius, labelRadius = props.labelRadius, children = props.children /*animate, animationDuration*/;
    var _a = (0, react_1.useState)(100), height = _a[0], setHeight = _a[1];
    var _b = (0, react_1.useState)(100), width = _b[0], setWidth = _b[1];
    function _onLayout(event) {
        var _a = event.nativeEvent.layout, height = _a.height, width = _a.width;
        setHeight(height);
        setWidth(width);
    }
    //   const { height, width } = this.state;
    // if (!data && dataPoints) {
    //     throw `"dataPoints" have been renamed to "data" to better reflect the fact that it's an array of objects`
    // }
    if (data.length === 0) {
        return <react_native_1.View style={style}/>;
    }
    var maxRadius = Math.min(width, height) / 2;
    if (Math.min.apply(Math, data.map(function (obj, i, d) { return valueAccessor(obj, i, d); })) < 0) {
        console.error("don't pass negative numbers to pie-chart, it makes no sense!");
    }
    var _outerRadius = _calculateRadius(outerRadius, maxRadius, maxRadius);
    var _innerRadius = _calculateRadius(innerRadius, maxRadius, 0);
    var _labelRadius = _calculateRadius(labelRadius, maxRadius, _outerRadius);
    if ((outerRadius || 0) > 0 && _innerRadius >= (outerRadius || 0)) {
        console.warn('innerRadius is equal to or greater than outerRadius');
    }
    var arcs = data.map(function (item) {
        var arc = shape
            .arc()
            .outerRadius(_outerRadius)
            .innerRadius(_innerRadius)
            .padAngle(padAngle); // Angle between sections
        //console.log(`O:${_outerRadius}I:${_innerRadius}P:${padAngle}`)
        /**** Not reallt sure what this will do  I think it ws supposed to be a manual arc.. but I done this it works.****/
        item.arc &&
            Object.entries(item.arc).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                if (typeof arc[key] === 'function') {
                    if (typeof value === 'string') {
                        arc[key]((Number(value.split('%')[0]) / 100) * _outerRadius);
                    }
                    else {
                        arc[key](value);
                    }
                }
            });
        return arc;
    });
    var labelArcs = data.map(function (item, index) {
        if (labelRadius) {
            return shape
                .arc()
                .outerRadius(_labelRadius)
                .innerRadius(_labelRadius)
                .padAngle(padAngle);
        }
        return arcs[index];
    });
    var pieSlices = shape
        .pie()
        .value(function (d, i, dd) { return valueAccessor(d, i, dd); })
        .sort(sort)
        .startAngle(startAngle)
        .endAngle(endAngle)(data);
    var slices = pieSlices.map(function (slice, index) { return (__assign(__assign({}, slice), { pieCentroid: arcs[index].centroid(slice), labelCentroid: labelArcs[index].centroid(slice) })); });
    var extraProps = {
        width: width,
        height: height,
        data: data,
        slices: slices
    };
    return (<react_native_1.View pointerEvents={'box-none'} style={style}>
            <react_native_1.View pointerEvents={'box-none'} style={{ flex: 1 }} onLayout={_onLayout}>
                {height > 0 && width > 0 && (<react_native_svg_1["default"] pointerEvents={react_native_1.Platform.OS === 'android' ? 'box-none' : undefined} style={{ height: height, width: width }}>
                        {/* center the progress circle*/}
                        <react_native_svg_1.G x={width / 2} y={height / 2}>
                            {react_1["default"].Children.map(children, function (child) {
                if (child && child.props.belowChart) {
                    return react_1["default"].cloneElement(child, extraProps);
                }
                return null;
            })}
                            {pieSlices.map(function (slice, index) {
                var _a = data[index], key = _a.key, onPress = _a.onPress, props = _a.props;
                return (<react_native_svg_1.Path key={key} onPress={onPress} {...props} d={arcs[index](slice) || undefined}/>);
            })}
                            {react_1["default"].Children.map(children, function (child) {
                if (child && !child.props.belowChart) {
                    return react_1["default"].cloneElement(child, extraProps);
                }
                return null;
            })}
                        </react_native_svg_1.G>
                    </react_native_svg_1["default"]>)}
            </react_native_1.View>
        </react_native_1.View>);
}
exports["default"] = PieChart;
