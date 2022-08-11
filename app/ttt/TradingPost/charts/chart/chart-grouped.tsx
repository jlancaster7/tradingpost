import React, { PureComponent, ReactElement, useState } from 'react'
import * as array from 'd3-array'
import * as scale from 'd3-scale'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import Svg, { SvgProps } from 'react-native-svg'
import Path from '../animated-path'
import Chart, { ChartChild, ChartProps, ChartScale, Point } from './chart'

// class ChartGrouped1 extends PureComponent {
//     state = {
//         width: 0,
//         height: 0,
//     }

//     _onLayout(event) {
//         const {
//             nativeEvent: {
//                 layout: { height, width },
//             },
//         } = event
//         this.setState({ height, width })
//     }

//     createPaths() {
//         throw 'Extending "ChartGrouped" requires you to override "createPaths'
//     }

//     render() {
//         const {
//             data,
//             xAccessor,
//             yAccessor,
//             yScale,
//             xScale,
//             style,
//             animate,
//             animationDuration,
//             numberOfTicks,
//             contentInset: { top = 0, bottom = 0, left = 0, right = 0 },
//             gridMax,
//             gridMin,
//             clampX,
//             clampY,
//             svg,
//             children,
//         } = this.props

//         const { width, height } = this.state

//         if (data.length === 0) {
//             return <View style={style} />
//         }

//         const mappedData = data.map((dataArray) =>
//             dataArray.data.map((item, index) => ({
//                 y: yAccessor({ item, index }),
//                 x: xAccessor({ item, index }),
//             }))
//         )

//         const yValues = array.merge(mappedData).map((item) => item.y)
//         const xValues = array.merge(mappedData).map((item) => item.x)

//         const yExtent = array.extent([...yValues, gridMin, gridMax])
//         const xExtent = array.extent([...xValues])

//         const { yMin = yExtent[0], yMax = yExtent[1], xMin = xExtent[0], xMax = xExtent[1] } = this.props

//         //invert range to support svg coordinate system
//         const y = yScale()
//             .domain([yMin, yMax])
//             .range([height - bottom, top])
//             .clamp(clampY)

//         const x = xScale()
//             .domain([xMin, xMax])
//             .range([left, width - right])
//             .clamp(clampX)

//         const paths = this.createPaths({
//             data: mappedData,
//             x,
//             y,
//         })

//         const ticks = y.ticks(numberOfTicks)

//         const extraProps = {
//             x,
//             y,
//             data,
//             ticks,
//             width,
//             height,
//             ...paths,
//         }

//         return (
//             <View style={style}>
//                 <View style={{ flex: 1 }} onLayout={(event) => this._onLayout(event)}>
//                     {height > 0 && width > 0 && (
//                         <Svg style={{ height, width }}>
//                             {React.Children.map(children, (child) => {
//                                 if (child && child.props.belowChart) {
//                                     return React.cloneElement(child, extraProps)
//                                 }
//                                 return null
//                             })}
//                             {paths.path.map((path, index) => {
//                                 const { svg: pathSvg } = data[index]
//                                 const key = path + '-' + index
//                                 return (
//                                     <Path
//                                         key={key}
//                                         fill={'none'}
//                                         {...svg}
//                                         {...pathSvg}
//                                         d={path}
//                                         animate={animate}
//                                         animationDuration={animationDuration}
//                                     />
//                                 )
//                             })}
//                             {React.Children.map(children, (child) => {
//                                 if (child && !child.props.belowChart) {
//                                     return React.cloneElement(child, extraProps)
//                                 }
//                                 return null
//                             })}
//                         </Svg>
//                     )}
//                 </View>
//             </View>
//         )
//     }
// }

// ChartGrouped.propTypes = {
//     ...Chart.propTypes,
//     data: PropTypes.arrayOf(
//         PropTypes.shape({
//             data: PropTypes.oneOfType([
//                 PropTypes.arrayOf(PropTypes.object),
//                 PropTypes.arrayOf(PropTypes.number),
//                 PropTypes.arrayOf(PropTypes.array),
//             ]),
//             svg: PropTypes.object,
//         })
//     ).isRequired,
// }

// ChartGrouped.defaultProps = {
//     ...Chart.defaultProps,
// }

//export default ChartGrouped1

export interface GroupChartChild<D> extends Omit<ChartChild<{ data: D[] }>, "line" | "path"> {
    path: (string | null)[],
    lines: (string | null)[]
}

export type ChartGroupedProps<D> = Omit<ChartProps<D>, "data" | "createPaths" | "children"> & {
    children?: ReactElement<GroupChartChild<D>> | ReactElement<GroupChartChild<D>>[],
    data: { data: D[], svg?: SvgProps }[], createPaths: (input: {
        data: { x: number, y: number }[][],
        x: ChartScale,
        y: ChartScale,
    }) => { path: (string | null)[], lines: (string | null)[] }
}

export function ChartGrouped<D>(props: ChartGroupedProps<D>) {
    const {
        data,
        xAccessor = ({ item, index }) => index,
        yAccessor,
        yScale = scale.scaleLinear,
        xScale = scale.scaleLinear,
        style,
        animate,
        animationDuration,
        numberOfTicks,
        contentInset = { top: 0, bottom: 0, left: 0, right: 0 },
        gridMax,
        gridMin,
        clampX,
        clampY,
        svg,
        children,
        createPaths
    } = props

    const [width, setWidth] = useState<number>(100),
        [height, setHeight] = useState<number>(100);
    const { top, bottom, left, right } = contentInset;

    if (data.length === 0) {
        return <View style={style} />
    }

    const mappedData = data.map((dataArray) =>
        dataArray.data.map((item, index) => ({
            y: yAccessor ? yAccessor({ item, index }) : item as unknown as number,
            x: xAccessor({ item, index }),
        }))
    )

    const yValues = array.merge<Point>(mappedData).map((item) => item.y)
    const xValues = array.merge<Point>(mappedData).map((item) => item.x)

    const yExtent = array.extent([...yValues, gridMin || 0, gridMax || 0])
    const xExtent = array.extent([...xValues])

    const { yMin = yExtent[0] || 0, yMax = yExtent[1] || 0, xMin = xExtent[0] || 0, xMax = xExtent[1] || 0 } = props

    //invert range to support svg coordinate system
    const y = yScale()
        .domain([yMin, yMax])
        .range([height - bottom, top])
        .clamp(clampY || false)

    const x = xScale()
        .domain([xMin, xMax])
        .range([left, width - right])
        .clamp(clampX || false)

    const paths = createPaths({
        data: mappedData,
        x,
        y,
    })

    const ticks = y.ticks(numberOfTicks)

    const extraProps: GroupChartChild<D> = {
        x,
        y,
        data,
        ticks,
        width,
        height,
        ...paths,
    }

    return (
        <View style={style}>
            <View style={{ flex: 1 }} onLayout={(event) => {
                const {
                    nativeEvent: {
                        layout: { height, width },
                    },
                } = event
                setHeight(height);
                setWidth(width);
            }}>
                {height > 0 && width > 0 && (
                    <Svg style={{ height, width }}>
                        {React.Children.map(children, (child) => {
                            if (child && child.props.belowChart) {
                                return React.cloneElement(child, extraProps)
                            }
                            return null
                        })}
                        {paths.path.map((path, index) => {
                            const { svg: pathSvg } = data[index]
                            const key = path + '-' + index
                            return (
                                <Path
                                    key={key}
                                    fill={'none'}
                                    {...svg}
                                    {...pathSvg}
                                    d={path}
                                    animate={animate}
                                    animationDuration={animationDuration}
                                />
                            )
                        })}
                        {React.Children.map(children, (child) => {
                            if (child && !child.props.belowChart) {
                                return React.cloneElement(child, extraProps)
                            }
                            return null
                        })}
                    </Svg>
                )}
            </View>
        </View>
    )
}

export default ChartGrouped;