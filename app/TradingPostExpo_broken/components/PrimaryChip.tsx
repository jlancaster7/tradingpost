import React from "react";
import { Button } from "@ui-kitten/components";
import { AppColors } from "../constants/Colors";
import { sizes } from "../style";
import { Text } from 'react-native'
export function PrimaryChip(props: { label: string }) {
    return <Button
        key={props.label}
        style={ {backgroundColor: AppColors.primary,borderColor: AppColors.primary, marginRight: sizes.rem1 / 4 }}
        //label={props.label}
    ><Text style={{ color: "white" }}>{props.label}</Text></Button>
}