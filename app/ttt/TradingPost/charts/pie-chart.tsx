import React, { Component, FC, PureComponent, ReactChild, ReactChildren, ReactElement, ReactNode, useState } from 'react'
import { View, Platform, ViewStyle, GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import PropTypes from 'prop-types'
import * as shape from 'd3-shape'
import Svg, { G, Path, PathProps } from 'react-native-svg'

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

function _calculateRadius(arg: Length | undefined, max: number, defaultVal: number) {
    if (typeof arg === 'string') {
        return (Number(arg.split('%')[0]) / 100) * max
    } else if (arg) {
        return arg
    } else {
        return defaultVal
    }
}


//Can be used as a default type if that needs to be setup ...
export type Datum = {
    props?: PathProps,
    key?: string,
    onPress?: (event: GestureResponderEvent) => void,
    value: number,
    arc?: Record<string, Length>
}

type Length = number | string;
type ItemType = { value: number }

//width,
//height,
//data,
//slices,

export interface PieChartChild<D> {
    width?: number,
    height?: number,
    data?: D[],
    slices?: {
        pieCentroid: [number, number];
        labelCentroid: [number, number];
        data: Datum;
        value: number;
        index: number;
        startAngle: number;
        endAngle: number;
        padAngle: number;
    }[],
    belowChart?: boolean
}

export default function PieChart(props: {
    data: Datum[],
    //dataPoints,
    innerRadius?: Length,
    outerRadius?: Length,
    labelRadius?: Length,
    padAngle?: number,
    //animate?: boolean,
    //animationDuration?: number,
    style?: ViewStyle,
    sort?: (a: Datum, b: Datum) => number,
    valueAccessor?: (d: Datum, i: number, data: Datum[]) => number,
    children?: ReactElement<PieChartChild<Datum>>,
    startAngle?: number,
    endAngle?: number,
}) {

    const padAngle = props.padAngle || 0.05;
    const startAngle = props.startAngle || 0;
    const endAngle = props.endAngle || Math.PI * 2;
    const valueAccessor = props.valueAccessor || ((item) => item.value)
    const innerRadius = props.innerRadius || '50%';
    const sort = props.sort || ((a: Datum, b: Datum) => b.value - a.value)
    const { data, style, outerRadius, labelRadius, children /*animate, animationDuration*/ } = props;

    const [height, setHeight] = useState(100);
    const [width, setWidth] = useState(100);

    function _onLayout(event: LayoutChangeEvent) {
        const {
            nativeEvent: {
                layout: { height, width },
            },
        } = event

        setHeight(height);
        setWidth(width);
    }
    //   const { height, width } = this.state;
    // if (!data && dataPoints) {
    //     throw `"dataPoints" have been renamed to "data" to better reflect the fact that it's an array of objects`
    // }

    if (data.length === 0) {
        return <View style={style} />
    }

    const maxRadius = Math.min(width, height) / 2

    if (Math.min(...data.map((obj, i, d) => valueAccessor(obj, i, d))) < 0) {
        console.error("don't pass negative numbers to pie-chart, it makes no sense!")
    }

    const _outerRadius = _calculateRadius(outerRadius, maxRadius, maxRadius)
    const _innerRadius = _calculateRadius(innerRadius, maxRadius, 0)
    const _labelRadius = _calculateRadius(labelRadius, maxRadius, _outerRadius)

    if ((outerRadius || 0) > 0 && _innerRadius >= (outerRadius || 0)) {
        console.warn('innerRadius is equal to or greater than outerRadius')
    }

    const arcs = data.map((item) => {
        const arc = shape
            .arc<Datum>()
            .outerRadius(_outerRadius)
            .innerRadius(_innerRadius)
            .padAngle(padAngle) // Angle between sections

        //console.log(`O:${_outerRadius}I:${_innerRadius}P:${padAngle}`)
        /**** Not reallt sure what this will do  I think it ws supposed to be a manual arc.. but I done this it works.****/
        item.arc &&
            Object.entries(item.arc).forEach(([key, value]) => {
                if (typeof arc[key as keyof typeof arc] === 'function') {
                    if (typeof value === 'string') {
                        (arc[key as keyof typeof arc] as any)((Number(value.split('%')[0]) / 100) * _outerRadius)
                    } else {
                        (arc[key as keyof typeof arc] as any)(value)
                    }
                }

            })

        return arc;
    })

    const labelArcs = data.map((item, index) => {
        if (labelRadius) {
            return shape
                .arc<Datum>()
                .outerRadius(_labelRadius)
                .innerRadius(_labelRadius)
                .padAngle(padAngle)
        }
        return arcs[index]
    })

    const pieSlices = shape
        .pie<Datum>()
        .value((d, i, dd) => valueAccessor(d, i, dd))
        .sort(sort)
        .startAngle(startAngle)
        .endAngle(endAngle)(data)

    const slices = pieSlices.map((slice, index) => ({
        ...slice,
        pieCentroid: arcs[index].centroid(slice),
        labelCentroid: labelArcs[index].centroid(slice),
    }))

    const extraProps = {
        width,
        height,
        data,
        slices,
    }

    return (
        <View pointerEvents={'box-none'} style={style} >
            <View pointerEvents={'box-none'} style={{ flex: 1 }} onLayout={_onLayout}>
                {height > 0 && width > 0 && (
                    <Svg pointerEvents={Platform.OS === 'android' ? 'box-none' : undefined} style={{ height, width }}>
                        {/* center the progress circle*/}
                        < G x={width / 2} y={height / 2}>
                            {
                                React.Children.map(children, (child) => {
                                    if (child && child.props.belowChart) {
                                        return React.cloneElement(child, extraProps)
                                    }
                                    return null
                                })
                            }
                            {
                                pieSlices.map((slice, index) => {
                                    const { key, onPress, props } = data[index]
                                    return (
                                        <Path
                                            key={key}
                                            onPress={onPress}
                                            {...props}
                                            d={arcs[index](slice) || undefined}
                                        //animate={animate}
                                        //animationDuration={animationDuration}
                                        />
                                    )
                                })}
                            {
                                React.Children.map(children, (child) => {
                                    if (child && !child.props.belowChart) {
                                        return React.cloneElement(child, extraProps)
                                    }
                                    return null
                                })
                            }
                        </G>
                    </Svg>
                )}
            </View>
        </View>
    )


}
