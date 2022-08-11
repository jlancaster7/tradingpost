import React from "react";
import { Button } from "@ui-kitten/components";
import { AppColors } from "../constants/Colors";
import { sizes } from "../style";
import { Text, ViewStyle } from 'react-native'
export function PrimaryChip(props: { label: string, isAlt?: boolean, style?: ViewStyle }) {
    const color = props.isAlt ? AppColors.secondary : AppColors.primary
    return <Button
        key={props.label}
        style={[{ borderRadius: 16, backgroundColor: color, borderColor: color, marginRight: sizes.rem1 / 4, height: sizes.rem2, minHeight: sizes.rem2 }, props.style]}
    //label={props.label}
    ><Text numberOfLines={1} style={{ color: "white" }}>{props.label}</Text></Button>
}