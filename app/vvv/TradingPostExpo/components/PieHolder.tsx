
import React from "react";
import { Alert, View } from "react-native";
import { Text } from "react-native-svg";
import Grid from "../charts-js/grid";
import XAxis from "../charts-js/x-axis";
import YAxis from "../charts-js/y-axis";
import LineChart from "../charts/line-chart/line-chart";;
import PieChart, { PieChartChild, Datum } from "../charts/pie-chart";
import { chartColors, row, sizes } from "../style";


const data = [5, 10, 4, 6, 8];
const data2 = [1, 5, 3, 9.7, 2.3, 7];

export function PieLabels(props: PieChartChild<Datum>) {
    return <>
        {props.slices?.map((d) => {
            return <Text
                key={d.index}
                x={d.labelCentroid[0]}
                y={d.labelCentroid[1]}
                textAnchor={'middle'}
                alignmentBaseline={'center'}
                fontSize={14}
                stroke={'black'}
                strokeWidth={0.2}>
                {d.data.key}
            </Text>
            //
        })}
    </>
}
export function PieHolder() {
    return <PieChart innerRadius={8} style={{ aspectRatio: 16 / 9 }}

        data={data.map((value, i) => ({ value, onPress: () => Alert.alert("Value is " + value), key: `key_${i}`, props: { fill: chartColors[i] } }))}>
        <PieLabels key="LABELZ" />
    </PieChart>
}


export const LineHolder = (props: any) => {
    let lineData = []
    let gridData;
    let xData;
    if (!props.data) {
        lineData =  data2;
        gridData = data2;
        xData = data2;
    }
    else {
        lineData = props.data;
        gridData = lineData.map((a: any) => a.return)
        xData = lineData.map((a: any) => new Date(a.date))
    }
    console.log(gridData);
    const contentInset = { top: 5, bottom: 5, right: 5, left: 5 }
    return <View style={[row, { aspectRatio: 16 / 9, padding: sizes.rem0_5, borderWidth: 1, borderRadius: sizes.rem1, borderColor: "#ccc" }]}>
        
        <View
            style={{ width: sizes.rem1_5, height: "85%", marginRight:"3%" }}
        >
            <YAxis
                data={gridData}
                style={{ width: "100%", height: "100%", flex: 1 }}
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                    
                }}
                numberOfTicks={10}
                contentInset={contentInset}
                //yAccessor={(value: any)=> value - value % 1}
                formatLabel={(value: any) => `$${value.toFixed(2)}`}
            />
*/        </View>
            
        <View style={{ flex: 1, height: "100%" }}>
            <LineChart svg={{ stroke: "blue" }} style={{ flex: 1 }} data={gridData} 
                //numberOfTicks={10}
                contentInset={contentInset}
                >
                
                <Grid direction={undefined} />
            </LineChart>
            
            <XAxis
                data={gridData}
                style={{ height: sizes.rem1, width: "98%" }}
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                }}
                contentInset={contentInset}
                //min={xData[0]}
                //max={xData[xData.length - 1]}
                //xAccessor={( index: any ) => index}
                numberOfTicks={10}
            //formatLabel={(value) => `${value}ºC`}
            />
        </View>
            
    </View>
}