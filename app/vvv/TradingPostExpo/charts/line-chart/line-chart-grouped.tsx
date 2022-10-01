import React from 'react'
import * as shape from 'd3-shape'
import { useCallback } from 'react'
import { ChartScale, Point } from '../chart/chart'
import ChartGrouped, { ChartGroupedProps } from '../chart/chart-grouped'

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


export function LineChartGrouped<D>(props: Omit<ChartGroupedProps<D>, "createPaths">) {
    const { curve = shape.curveLinear } = props,
        createPaths = useCallback((input: { data: Point[][], x: ChartScale, y: ChartScale }) => {
            const { data, x, y } = input;
            const lines = data.map((line) =>
                shape
                    .line<Point>()
                    .x((d) => x(d.x))
                    .y((d) => y(d.y))
                    .defined((item) => typeof item.y === 'number')
                    .curve(curve)(line)
            )

            return {
                path: lines,
                lines,
            }
        }, [curve]);

    return <ChartGrouped
        createPaths={createPaths}
        {...props}
    />
}
export default LineChartGrouped