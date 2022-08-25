import React from "react"
import { View } from "react-native"
import Grid from "../charts-js/grid"
import XAxis from "../charts-js/x-axis"
import YAxis from "../charts-js/y-axis"
import LineChartInternal from "../charts/line-chart/line-chart"
import { row, sizes } from "../style"

export const LineChart = (props: { data: number[] }) => {
    return <View style={[row, { aspectRatio: 16 / 9, padding: sizes.rem1, borderWidth: 1, borderRadius: sizes.rem1 / 4, borderColor: "#ccc" }]}>
        <View style={{ width: sizes.rem1, height: "100%" }}>
            <YAxis
                data={props.data}
                style={{ width: "100%", flex: 1 }}
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                }}
            //numberOfTicks={10}
            //formatLabel={(value) => `${value}ºC`}
            />
            <View
                style={{ width: "100%", height: sizes.rem1 }}
            ></View>
        </View>
        <View style={{ flex: 1, height: "100%" }}>
            <LineChartInternal svg={{ stroke: "blue" }} style={{ flex: 1 }} data={props.data} yAccessor={undefined}>
                <Grid />
            </LineChartInternal>
            <XAxis
                data={props.data}
                style={{ height: sizes.rem1, width: "100%" }}
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                }}
            //numberOfTicks={10}
            //formatLabel={(value) => `${value}ºC`}
            />
        </View>
    </View>
}