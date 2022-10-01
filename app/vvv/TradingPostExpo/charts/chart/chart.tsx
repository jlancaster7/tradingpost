import * as array from 'd3-array'
import * as scale from 'd3-scale'
import * as shape from 'd3-shape'
import PropTypes from 'prop-types'
import React, { PureComponent, ReactElement, useState } from 'react'
import { View, ViewStyle } from 'react-native'
import Svg, { SvgProps, Path } from 'react-native-svg'
//import Path from '../animated-path'

// class Chart1 extends PureComponent {
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
//         throw 'Extending "Chart" requires you to override "createPaths'
//     }

//     render() {
//         //     const {
//         //         data,
//         //         xAccessor,
//         //         yAccessor,
//         //         yScale,
//         //         xScale,
//         //         style,
//         //         animate,
//         //         animationDuration,
//         //         numberOfTicks,
//         //         contentInset: { top = 0, bottom = 0, left = 0, right = 0 },
//         //         gridMax,
//         //         gridMin,
//         //         clampX,
//         //         clampY,
//         //         svg,
//         //         children,
//         //     } = this.props

//         //     const { width, height } = this.state

//         //     if (data.length === 0) {
//         //         return <View style={style} />
//         //     }

//         //     const mappedData = data.map((item, index) => ({
//         //         y: yAccessor({ item, index }),
//         //         x: xAccessor({ item, index }),
//         //     }))

//         //     const yValues = mappedData.map((item) => item.y)
//         //     const xValues = mappedData.map((item) => item.x)

//         //     const yExtent = array.extent([...yValues, gridMin, gridMax])
//         //     const xExtent = array.extent([...xValues])

//         //     const { yMin = yExtent[0], yMax = yExtent[1], xMin = xExtent[0], xMax = xExtent[1] } = this.props

//         //     //invert range to support svg coordinate system
//         //     const y = yScale()
//         //         .domain([yMin, yMax])
//         //         .range([height - bottom, top])
//         //         .clamp(clampY)

//         //     const x = xScale()
//         //         .domain([xMin, xMax])
//         //         .range([left, width - right])
//         //         .clamp(clampX)

//         //     const paths = this.createPaths({
//         //         data: mappedData,
//         //         x,
//         //         y,
//         //     })

//         //     const ticks = y.ticks(numberOfTicks)

//         //     const extraProps = {
//         //         x,
//         //         y,
//         //         data,
//         //         ticks,
//         //         width,
//         //         height,
//         //         ...paths,
//         //     }

//         //     return (
//         //         <View style={style}>
//         //             <View style={{ flex: 1 }} onLayout={(event) => this._onLayout(event)}>
//         //                 {height > 0 && width > 0 && (
//         //                     <Svg style={{ height, width }}>
//         //                         {React.Children.map(children, (child) => {
//         //                             if (child && child.props.belowChart) {
//         //                                 return React.cloneElement(child, extraProps)
//         //                             }
//         //                             return null
//         //                         })}
//         //                         <Path
//         //                             fill={'none'}
//         //                             {...svg}
//         //                             d={paths.path}
//         //                             animate={animate}
//         //                             animationDuration={animationDuration}
//         //                         />
//         //                         {React.Children.map(children, (child) => {
//         //                             if (child && !child.props.belowChart) {
//         //                                 return React.cloneElement(child, extraProps)
//         //                             }
//         //                             return null
//         //                         })}
//         //                     </Svg>
//         //                 )}
//         //             </View>
//         //         </View>
//         //     )
//     }

// }

// Chart.propTypes = {
//     data: PropTypes.oneOfType([
//         PropTypes.arrayOf(PropTypes.object),
//         PropTypes.arrayOf(PropTypes.number),
//         PropTypes.arrayOf(PropTypes.array),
//     ]).isRequired,
//     svg: PropTypes.object,

//     style: PropTypes.any,

//     animate: PropTypes.bool,
//     animationDuration: PropTypes.number,

//     curve: PropTypes.func,
//     contentInset: PropTypes.shape({
//         top: PropTypes.number,
//         left: PropTypes.number,
//         right: PropTypes.number,
//         bottom: PropTypes.number,
//     }),
//     numberOfTicks: PropTypes.number,

//     gridMin: PropTypes.number,
//     gridMax: PropTypes.number,

//     yMin: PropTypes.any,
//     yMax: PropTypes.any,
//     xMin: PropTypes.any,
//     xMax: PropTypes.any,
//     clampX: PropTypes.bool,
//     clampY: PropTypes.bool,

//     xScale: PropTypes.func,
//     yScale: PropTypes.func,

//     xAccessor: PropTypes.func,
//     yAccessor: PropTypes.func,
// }

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
export type Point = { x: number, y: number };
export type Accessor<D> = (p: { item: D, index: number }) => number;
export type ChartScale = scale.ScaleLinear<number, number>;
export interface ChartChild<D = any> {
    width?: number,
    height?: number,
    x: ChartScale,
    y: ChartScale,
    data?: D[],
    ticks:number[],
    path:string|null,
    line:string|null
    // slices?: {
    //     pieCentroid: [number, number];
    //     labelCentroid: [number, number];
    //     data: Datum;
    //     value: number;
    //     index: number;
    //     startAngle: number;
    //     endAngle: number;
    //     padAngle: number;
    // }[],
    belowChart?: boolean
}
//export default Chart
export type ChartProps<D> = {
    data: D[],
    svg?: SvgProps,
    style?: ViewStyle,
    animate?: boolean,
    animationDuration?: number,
    curve?: shape.CurveFactoryLineOnly | shape.CurveFactory,
    contentInset?: {
        top: number,
        left: number,
        right: number,
        bottom: number,
    },
    numberOfTicks?: number,
    gridMin?: number,
    gridMax?: number,
    yMin?: number,
    yMax?: number,
    xMin?: number,
    xMax?: number,
    clampX?: boolean,
    clampY?: boolean,
    createPaths: (input: {
        data: { x: number, y: number }[],
        x: ChartScale,
        y: ChartScale,
    }) => { path: string | null, line: string | null }
    xScale?: () => ChartScale,
    yScale?: () => ChartScale,
    xAccessor?: Accessor<D>,
    yAccessor: D extends number ? (Accessor<D> | undefined) : Accessor<D>
    children?: ReactElement<ChartChild<D>>,
}


export function Chart<D>(props: ChartProps<D>) {
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

    const {
        data,
        xAccessor = ({ item, index }) => index,
        yAccessor,
        yScale = scale.scaleLinear,
        xScale = scale.scaleLinear,
        style,
        animate,
        animationDuration,
        numberOfTicks = 10,
        contentInset = { top: 0, bottom: 0, left: 0, right: 0 },
        gridMax,
        gridMin,
        clampX,
        clampY,
        svg,
        children,
        createPaths,
    } = props
    const { top, bottom, left, right } = contentInset;
    const [width, setWidth] = useState<number>(100),
        [height, setHeight] = useState<number>(100);


    if (data.length === 0) {
        return <View style={style} />
    }

    const mappedData = data.map((item, index) => ({
        y: yAccessor ? yAccessor({ item, index }) : (item as unknown as number),
        x: xAccessor({ item, index }),
    }))

    const yValues = mappedData.map((item) => item.y)
    const xValues = mappedData.map((item) => item.x)

    const yExtent = array.extent([...yValues])
    const xExtent = array.extent([...xValues])

    const { yMin = yExtent[0] || 0, yMax = yExtent[1] || 0, xMin = xExtent[0] || 0, xMax = xExtent[1] || 0 } = props;

    //invert range to support svg coordinate system
    const y = yScale()
        .domain([yMin, yMax])
        .range([height - bottom, top])
        .clamp(clampY || false);

    const x = xScale()
        .domain([xMin, xMax])
        .range([left, width - right])
        .clamp(clampX || false);

    const paths = createPaths({
        data: mappedData,
        x,
        y,
    })

    const ticks = y.ticks(numberOfTicks)

    const extraProps: ChartChild<D> = {
        x,
        y,
        data,
        ticks,
        width,
        height,
        ...paths,
    } 

    //console.log(`SIZE IS : ${width},${height}`);
    //console.log(paths.path);

    return (
        <View style={style}>
            <View style={{ flex: 1 }} onLayout={(event) => {
                const {
                    nativeEvent: {
                        layout: { height, width },
                    },
                } = event
                console.log("LAYING OUT");
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
                        <Path
                            fill={'none'}
                            {...svg}
                            d={paths.path || undefined}
                            //animate={animate}
                            //animationDuration={animationDuration}
                        />
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

export default Chart;