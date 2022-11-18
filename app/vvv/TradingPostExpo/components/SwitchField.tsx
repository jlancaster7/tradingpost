import React, { ReactElement } from "react";
import { Toggle } from "@ui-kitten/components";
import { Icon, Text } from "@ui-kitten/components";
import { View, Animated } from "react-native"
import { TooltipComponent } from "./ToolTip";
import { sizes } from "../style";


export function SwitchField(props: any) {
    return <View style={props.viewStyle}>
        <Toggle
            style={props.toggleStyle}
            checked={props.checked}
            onChange={props.onChange} />
        <View style={[props.toolTipText ? {display: 'flex'} : {display: 'none'}, {justifyContent: 'center', flex: 1}]}>
            <TooltipComponent text={props.toolTipText}/>
        </View>
        <Text style={props.textStyle}>
            {props.label}
        </Text>
    </View> 
    

}

