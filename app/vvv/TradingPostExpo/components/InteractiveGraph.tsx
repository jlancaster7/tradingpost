import React, { useEffect, useRef, useState } from 'react';
// import * as React from 'react'

import { chartColors, row, sizes } from "../style";
import {
    PanResponder,
    Dimensions,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart, XAxis, YAxis } from '../charts-js/';
import {
    Circle,
    Defs,
    G,
    Line,
    LinearGradient,
    Path,
    Rect,
    Stop,
    Text as SvgText,
} from 'react-native-svg';
import * as shape from 'd3-shape';
import { toDollarsAndCents, toDateMonthYear, toDateDayMonth } from '../utils/misc';


export default InteractiveChart;

function InteractiveChart(props: any) {
    const apx = (size = 0) => {
        let width = Dimensions.get('window').width; //useDimensions
        if (width > 680) width = 680
        return (width / 750) * size;
    };
    
    if (!props.data) {
        props = {data: [{date: String(new Date()), return: 2}, {date: String(new Date("9/1/2022")) , return: 1}]}
    }
    //console.log(props.data.map((a: any) => a.date));
    const dateList = props.data.map((a: any) => a.x);
    //const [dateList, setDateList] = useState([]);


    const priceList = props.data.map((a: any) => a.y)
    //const [priceList, setPriceList] = useState([]);
    
    const size = useRef(dateList.length);
    size.current = dateList.length;
    
    
    const [positionX, setPositionX] = useState(-1);// The currently selected X coordinate position

    const panResponder = useRef(
        PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderTerminationRequest: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {
                updatePosition(evt.nativeEvent.locationX);
                return true;
            },
            onPanResponderMove: (evt, gestureState) => {
                updatePosition(evt.nativeEvent.locationX);
                return true;
            },
            onPanResponderRelease: () => {
                setPositionX(-1);
            },
        })
    );

    const updatePosition = (x: any) => {
        const YAxisWidth = apx(130);
        const x0 = apx(0);// x0 position
        const chartWidth = apx(750) - YAxisWidth - x0;
        const xN = x0 + chartWidth;//xN position
        const xDistance = chartWidth / size.current;// The width of each coordinate point

        
        if (x <= x0) {
            x = x0;
        }
        if (x >= xN) {
            x = xN;
        }

        // console.log((x - x0) )

        // The selected coordinate x :
        // (x - x0)/ xDistance = value
        let value = Number(((x - x0) / xDistance).toFixed(0));
        if (value >= size.current - 1) {
            value = size.current - 1; // Out of chart range, automatic correction
        }

        setPositionX(Number(value));
    };

    const CustomGrid = ( props: {x: any, y: any, ticks: any, performance: Boolean} ) => (

        <G>
            {
                // Horizontal grid
                props.ticks.map((tick: any) => (
                    
                    <Line
                        key={tick}
                        x1="0%"
                        x2="100%"
                        y1={props.y(1)}
                        y2={props.y(1)}
                        strokeWidth={props.performance ? 0.5 : 0}
                        stroke="#35A265"
                        
                    />
                ))
            }
            {
                // Vertical grid
                /*
                priceList.map((_, index) => (
                    <Line
                        key={index.toString()}
                        y1="0%"
                        y2="0%"
                        x1={props.x(index)}
                        x2={props.x(index)}
                        stroke="#EEF3F6"
                    />
                ))
                */
            }
        </G>
    );

    const CustomLine = ( line: any ) => (
        <Path
            key="line"
            d={line}
            stroke="#FEBE18"
            strokeWidth={apx(6)}
            fill="none"
        />
    );

    const CustomGradient = () => (
        <Defs key="gradient">
            <LinearGradient id="gradient" x1="0" x2="0%" y2="100%">
                {/* <Stop offset="0%" stopColor="rgb(134, 65, 244)" /> */}
                {/* <Stop offset="100%" stopColor="rgb(66, 194, 244)" /> */}

                <Stop offset="0%" stopColor="#FEBE18" stopOpacity={0.25} />
                <Stop offset="100%" stopColor="#FEBE18" stopOpacity={0} />
            </LinearGradient>
        </Defs>
    );

    const Tooltip = ( props: {x: any, y: any, ticks: any} ) => {
        if (positionX < 0) {
            return null;
        }
        const date = dateList[positionX];

        return (
            <G x={props.x(positionX)} key="tooltip">
                <G
                    x={positionX > size.current / 2 ? -apx(300 + 10) : apx(10)}
                    y={props.y(priceList[positionX]) - apx(10)}>
                    <Rect
                        y={-apx(24 + 24 + 20) / 2}
                        rx={apx(12)} // borderRadius
                        ry={apx(12)} // borderRadius
                        width={apx(300)}
                        height={apx(96)}
                        stroke="rgba(254, 190, 24, 0.27)"
                        fill="rgba(255, 255, 255, 0.8)"
                    />

                    <SvgText x={apx(20)} fill="#617485" opacity={0.65} fontSize={apx(24)}>
                        {(new Date(date)).toLocaleDateString()}
                    </SvgText>
                    <SvgText
                        x={apx(20)}
                        y={apx(24 + 20)}
                        fontSize={apx(24)}
                        fontWeight="bold"
                        fill="rgba(224, 188, 136, 1)">
                        {toDollarsAndCents(priceList[positionX])}
                    </SvgText>
                </G>

                <G x={props.x}>
                    <Line
                        y1={props.ticks[0]}
                        y2={props.ticks[Number(props.ticks.length)]}
                        stroke="#FEBE18"
                        strokeWidth={apx(4)}
                        strokeDasharray={[6, 3]}
                    />

                    <Circle
                        cy={props.y(priceList[positionX])}
                        r={apx(20 / 2)}
                        stroke="#fff"
                        strokeWidth={apx(2)}
                        fill="#FEBE18"
                    />
                </G>
            </G>
        );
    };

    const verticalContentInset = { top: 10, bottom: 10 };

    return (
        <View
            style={{
                backgroundColor: '#fff',
                alignItems: 'stretch',
                borderWidth: 1, 
                borderRadius: sizes.rem0_5 / 2,
                borderColor: "#ccc",
                padding: sizes.rem0_5,
                //aspectRatio: 16 / 9,
            }}>
            <View
                style={{
                    flexDirection: 'row',
                    width: "100%",
                    //height: apx(570),
                    aspectRatio: 16 / 9,
                    alignSelf: 'stretch',
                    
                }}>
                <View style={{ flex: 1 }} {...panResponder.current.panHandlers}>
                    <LineChart
                        style={{ flex: 1 }}
                        data={priceList}
                        //curve={shape.curveNatural}
                        curve={shape.curveMonotoneX}
                        contentInset={{ ...verticalContentInset }}
                        svg={{ stroke: "#11146F" }}>
                        {/*<CustomLine />*/}
                        <CustomGrid x={undefined} y={undefined} ticks={undefined} performance={props.performance} />
                        <CustomGradient />
                        <Tooltip x={undefined} y={undefined} ticks={undefined} />
                    </LineChart>
                </View>

                <YAxis
                    style={{ width: "12%" }}
                    data={priceList}
                    contentInset={verticalContentInset}
                    svg={{ fontSize: apx(18), fill: '#617485',
                }}
                    numberOfTicks={5}
                    
                    formatLabel={(value: any, index: any) => `$${String(value).split('.')[0].length > 2 ? value.toFixed(1) : value.toFixed(2)}`}
                />
            </View>
            <XAxis
                style={{
                    alignSelf: 'stretch',
                    // marginTop: apx(57),
                    width: "100%",
                    height: apx(70),
                }}
                numberOfTicks={props.period === '1D' ? 1 : 5}
                data={priceList}
                formatLabel={(value: any, index: any) => ['1D', '1W', '1M'].includes(props.period) ? toDateDayMonth(dateList[value]) : toDateMonthYear(dateList[value])}
                contentInset={{
                    left: apx(46),
                    right: apx(100),
                }}
                svg={{
                    fontSize: apx(18),
                    fill: '#617485',
                    y: apx(20),
                    rotation: 30,
                    textAnchor:'start'
                    // originY: 30,
                }}
            />
        </View>
    );
}