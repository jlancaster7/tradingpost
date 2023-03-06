
import { VictoryBar, VictoryChart, VictoryTheme, VictoryCandlestick, VictoryLine, VictoryAxis } from "victory-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, NativeSyntheticEvent, ScrollView, View, NativeScrollEvent, useWindowDimensions } from "react-native";
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipWeekends } from '@d3fc/d3fc-discontinuous-scale';
import { scaleTime } from 'd3-scale';

export const VictoryStockChart = (props: {data?: {open: number, high: number, low: number, close: number, x: Date}[], chartType?: string}) => {
    const {width: windowWidth} = useWindowDimensions()
    const [chartType, setChartType] = useState('')

    useEffect(() => {
        setChartType(props.chartType || 'line')
    }, [props.chartType])
    
    let discontinuousScale: any; 
    if (props.data?.length) {
        discontinuousScale = scaleDiscontinuous(
            scaleTime().domain([props.data[0].x, props.data[props.data?.length - 1].x]).range([0, props.data?.length ])
        ).discontinuityProvider(discontinuitySkipWeekends());
    }  
    return (<View style={{marginLeft: -15, marginTop: -40, marginBottom: -20}}>
        {chartType === 'candle' ? 
            <VictoryChart style={{}} width={windowWidth} domainPadding={{ x: 0 }} scale={{x: discontinuousScale}}>
                <VictoryCandlestick data={props.data} 
                    style={{data: {strokeWidth: 0}}}
                    candleColors={{ positive: "#1AA457", negative: "#D81222" }} 
                    animate={{duration: 1000, onLoad: { duration: 500 }}} 
                    scale={{x:'time'}}
                    wickStrokeWidth={props.data && props.data.length > 150 ? 0.5 : 1}
                    /> 
                <VictoryAxis tickFormat={(t) => `${(new Date(t)).getMonth() + 1}/${((new Date(t)).getFullYear()) % 2000}`}/>
                <VictoryAxis dependentAxis tickFormat={(t) => `$${t}`}/>
            </VictoryChart> :
        chartType === 'line' ? 
        <VictoryChart style={{}} width={windowWidth} domainPadding={{ x: 0 }} scale={{x: discontinuousScale}}>
            <VictoryLine data={props.data} 
                style={{data: {stroke: '#11146F', strokeWidth: 1}}}
                animate={{duration: 1000, onLoad: { duration: 500 }}} 
                y="close"
                /> 
            <VictoryAxis tickFormat={(t) => `${(new Date(t)).getMonth() + 1}/${((new Date(t)).getFullYear()) % 2000}`}/>
            <VictoryAxis dependentAxis tickFormat={(t) => `$${t}`}/>
        </VictoryChart> : 
        undefined}
        </View>
    )
}
