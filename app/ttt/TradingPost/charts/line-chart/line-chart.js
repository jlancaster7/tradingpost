"use strict";
exports.__esModule = true;
exports.LineChart = void 0;
var react_1 = require("react");
var shape = require("d3-shape");
var chart_1 = require("../chart/chart");
var react_2 = require("react");
// class LineChart2 extends Chart {
//     createPaths({ data, x, y }) {
//         const { curve } = this.props
//         const line = shape
//             .line()
//             .x((d) => x(d.x))
//             .y((d) => y(d.y))
//             .defined((item) => typeof item.y === 'number')
//             .curve(curve)(data)
//         return {
//             path: line,
//             line,
//         }
//     }
// }
// LineChart.propTypes = {
//     ...Chart.propTypes,
// }
// LineChart.defaultProps = {
//     ...Chart.defaultProps,
// }
function LineChart(props) {
    var _a = props.curve, curve = _a === void 0 ? shape.curveLinear : _a;
    var createPaths = (0, react_2.useCallback)(function (vals) {
        var data = vals.data, x = vals.x, y = vals.y;
        var line = shape
            .line()
            .x(function (d) { return x(d.x); })
            .y(function (d) { return y(d.y); })
            .defined(function (item) { return typeof item.y === 'number'; })
            .curve(curve)(data);
        return {
            path: line,
            line: line
        };
    }, [curve]);
    return <chart_1["default"] {...props} createPaths={createPaths}/>;
}
exports.LineChart = LineChart;
exports["default"] = LineChart;
