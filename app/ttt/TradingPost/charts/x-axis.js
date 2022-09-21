"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.XAxis = void 0;
var react_1 = require("react");
//import PropTypes from 'prop-types'
var react_native_1 = require("react-native");
var d3Scale = require("d3-scale");
var array = require("d3-array");
var react_native_svg_1 = require("react-native-svg");
var XAxis1 = /** @class */ (function (_super) {
    __extends(XAxis1, _super);
    function XAxis1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            width: 0,
            height: 0
        };
        return _this;
    }
    XAxis1.prototype._onLayout = function (event) {
        var _a = event.nativeEvent.layout, width = _a.width, height = _a.height;
        if (width !== this.state.width) {
            this.setState({ width: width, height: height });
        }
    };
    XAxis1.prototype._getX = function (domain) {
        var _a = this.props, scale = _a.scale, spacingInner = _a.spacingInner, spacingOuter = _a.spacingOuter, _b = _a.contentInset, _c = _b.left, left = _c === void 0 ? 0 : _c, _d = _b.right, right = _d === void 0 ? 0 : _d;
        var width = this.state.width;
        var x = scale()
            .domain(domain)
            .range([left, width - right]);
        if (scale === d3Scale.scaleBand) {
            x.paddingInner([spacingInner]).paddingOuter([spacingOuter]);
            //add half a bar to center label
            return function (value) { return x(value) + x.bandwidth() / 2; };
        }
        return x;
    };
    XAxis1.prototype.render = function () {
        var _this = this;
        var _a = this.props, style = _a.style, scale = _a.scale, data = _a.data, xAccessor = _a.xAccessor, formatLabel = _a.formatLabel, numberOfTicks = _a.numberOfTicks, svg = _a.svg, children = _a.children, min = _a.min, max = _a.max;
        var _b = this.state, height = _b.height, width = _b.width;
        if (data.length === 0) {
            return <react_native_1.View style={style}/>;
        }
        var values = data.map(function (item, index) { return xAccessor({ item: item, index: index }); });
        var extent = array.extent(values);
        var domain = scale === d3Scale.scaleBand ? values : [min || extent[0], max || extent[1]];
        var x = this._getX(domain);
        var ticks = numberOfTicks ? x.ticks(numberOfTicks) : values;
        var extraProps = {
            x: x,
            ticks: ticks,
            width: width,
            height: height,
            formatLabel: formatLabel
        };
        return (<react_native_1.View style={style}>
                <react_native_1.View style={{ flexGrow: 1 }} onLayout={function (event) { return _this._onLayout(event); }}>
                    {/*invisible text to allow for parent resizing*/}
                    <react_native_1.Text style={{
                opacity: 0,
                fontSize: svg.fontSize,
                fontFamily: svg.fontFamily,
                fontWeight: svg.fontWeight
            }}>
                        {formatLabel(ticks[0], 0)}
                    </react_native_1.Text>
                    {height > 0 && width > 0 && (<react_native_svg_1["default"] style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: height,
                    width: width
                }}>
                            <react_native_svg_1.G>
                                {react_1["default"].Children.map(children, function (child) {
                    return react_1["default"].cloneElement(child, extraProps);
                })}
                                {// don't render labels if width isn't measured yet,
                // causes rendering issues
                width > 0 &&
                    ticks.map(function (value, index) {
                        var _a = (data[index] || {}).svg, valueSvg = _a === void 0 ? {} : _a;
                        return (<react_native_svg_1.Text textAnchor={'middle'} originX={x(value)} alignmentBaseline={'hanging'} {...svg} {...valueSvg} key={index} x={x(value)}>
                                                {formatLabel(value, index)}
                                            </react_native_svg_1.Text>);
                    })}
                            </react_native_svg_1.G>
                        </react_native_svg_1["default"]>)}
                </react_native_1.View>
            </react_native_1.View>);
    };
    return XAxis1;
}(react_1.PureComponent));
// XAxis.propTypes = {
//     data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.object])).isRequired,
//     spacingInner: PropTypes.number,
//     spacingOuter: PropTypes.number,
//     formatLabel: PropTypes.func,
//     contentInset: PropTypes.shape({
//         left: PropTypes.number,
//         right: PropTypes.number,
//     }),
//     scale: PropTypes.func,
//     numberOfTicks: PropTypes.number,
//     xAccessor: PropTypes.func,
//     svg: PropTypes.object,
//     min: PropTypes.any,
//     max: PropTypes.any,
// }
XAxis.defaultProps = {
    spacingInner: 0.05,
    spacingOuter: 0.05,
    contentInset: {},
    svg: {},
    xAccessor: function (_a) {
        var index = _a.index;
        return index;
    },
    scale: d3Scale.scaleLinear,
    formatLabel: function (value) { return value; }
};
function XAxis(props) {
    // spacingInner: 0.05,
    // spacingOuter: 0.05,
    // contentInset: {},
    // svg: {},
    // xAccessor: ({ index }) => index,
    // scale: d3Scale.scaleLinear,
    // formatLabel: (value) => value,
    var _this = this;
    var style = props.style, _a = props.scale, scale = _a === void 0 ? d3Scale.scaleLinear : _a, data = props.data, xAccessor = props.xAccessor, formatLabel = props.formatLabel, numberOfTicks = props.numberOfTicks, svg = props.svg, children = props.children, min = props.min, max = props.max;
    var _b = (0, react_1.useState)(), width = _b[0], setWidth = _b[1], _c = (0, react_1.useState)(), height = _c[0], setHeight = _c[1];
    if (data.length === 0) {
        return <react_native_1.View style={style}/>;
    }
    var values = data.map(function (item, index) { return xAccessor({ item: item, index: index }); });
    var extent = array.extent(values);
    var domain = scale === d3Scale.scaleBand ? values : [min || extent[0], max || extent[1]];
    var x = this._getX(domain);
    var ticks = numberOfTicks ? x.ticks(numberOfTicks) : values;
    var extraProps = {
        x: x,
        ticks: ticks,
        width: width,
        height: height,
        formatLabel: formatLabel
    };
    return (<react_native_1.View style={style}>
            <react_native_1.View style={{ flexGrow: 1 }} onLayout={function (event) { return _this._onLayout(event); }}>
                {/*invisible text to allow for parent resizing*/}
                <react_native_1.Text style={{
            opacity: 0,
            fontSize: svg.fontSize,
            fontFamily: svg.fontFamily,
            fontWeight: svg.fontWeight
        }}>
                    {formatLabel(ticks[0], 0)}
                </react_native_1.Text>
                {height > 0 && width > 0 && (<react_native_svg_1["default"] style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: height,
                width: width
            }}>
                        <react_native_svg_1.G>
                            {react_1["default"].Children.map(children, function (child) {
                return react_1["default"].cloneElement(child, extraProps);
            })}
                            {// don't render labels if width isn't measured yet,
            // causes rendering issues
            width > 0 &&
                ticks.map(function (value, index) {
                    var _a = (data[index] || {}).svg, valueSvg = _a === void 0 ? {} : _a;
                    return (<react_native_svg_1.Text textAnchor={'middle'} originX={x(value)} alignmentBaseline={'hanging'} {...svg} {...valueSvg} key={index} x={x(value)}>
                                            {formatLabel(value, index)}
                                        </react_native_svg_1.Text>);
                })}
                        </react_native_svg_1.G>
                    </react_native_svg_1["default"]>)}
            </react_native_1.View>
        </react_native_1.View>);
}
exports.XAxis = XAxis;
exports["default"] = XAxis;
