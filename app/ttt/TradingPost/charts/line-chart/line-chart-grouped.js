"use strict";
exports.__esModule = true;
exports.LineChartGrouped = void 0;
var react_1 = require("react");
var shape = require("d3-shape");
var react_2 = require("react");
var chart_grouped_1 = require("../chart/chart-grouped");
// class LineChartGrouped1 extends ChartGrouped {
//     createPaths({ data, x, y }) {
//         const { curve } = this.props
//         const lines = data.map((line) =>
//             shape
//                 .line()
//                 .x((d) => x(d.x))
//                 .y((d) => y(d.y))
//                 .defined((item) => typeof item.y === 'number')
//                 .curve(curve)(line)
//         )
//         return {
//             path: lines,
//             lines,
//         }
//     }
// }
// LineChartGrouped1.propTypes = {
//     ...ChartGrouped.propTypes,
// }
// LineChartGrouped1.defaultProps = {
//     ...ChartGrouped.defaultProps,
// }
function LineChartGrouped(props) {
    var _a = props.curve, curve = _a === void 0 ? shape.curveLinear : _a, createPaths = (0, react_2.useCallback)(function (input) {
        var data = input.data, x = input.x, y = input.y;
        var lines = data.map(function (line) {
            return shape
                .line()
                .x(function (d) { return x(d.x); })
                .y(function (d) { return y(d.y); })
                .defined(function (item) { return typeof item.y === 'number'; })
                .curve(curve)(line);
        });
        return {
            path: lines,
            lines: lines
        };
    }, [curve]);
    return <chart_grouped_1["default"] createPaths={createPaths} {...props}/>;
}
exports.LineChartGrouped = LineChartGrouped;
exports["default"] = LineChartGrouped;
