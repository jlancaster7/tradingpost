import React from 'react'
import * as shape from 'd3-shape'
import * as scale from 'd3-scale'

import Chart, { ChartProps, ChartScale, Point } from '../chart/chart'
import { useCallback } from 'react'

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

export function LineChart<D>(props: Omit<ChartProps<D>, "createPaths">) {
    const { curve = shape.curveLinear } = props;
    const createPaths = useCallback((vals: { data: Point[], x: ChartScale, y: ChartScale }) => {
        const { data, x, y } = vals;
        const line = shape
            .line<Point>()
            .x((d) => x(d.x))
            .y((d) => y(d.y))
            .defined((item) => typeof item.y === 'number')
            .curve(curve)(data)
        return {
            path: line,
            line,
        }
    }, [curve])

    return <Chart {...props} createPaths={createPaths} />
}
export default LineChart
