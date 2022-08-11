
import React from "react";
import { Alert } from "react-native";
import { Text } from "react-native-svg";
import PieChart, { PieChartChild, Datum } from "../charts/pie-chart";
import { chartColors } from "../style";


const data = [5, 10, 4, 6, 8];
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
    return <PieChart innerRadius={8} style={{ aspectRatio: 16 / 9 }} data={data.map((value, i) => ({ value, onPress: () => Alert.alert("Value is " + value), key: `key_${i}`, props: { fill: chartColors[i] } }))}>
        <PieLabels key="LABELZ" />
    </PieChart>
}