import React from "react";
import { Chip, Colors } from "react-native-ui-lib";
import { sizes } from "../style";

export function PrimaryChip(props:{label:string}) {
    return <Chip
        key={props.label}
        labelStyle={{color:"white"}}
        backgroundColor={Colors.primary}
        containerStyle={{borderColor:Colors.primary, marginRight:sizes.rem1/4}}
        label={props.label}
    />
}