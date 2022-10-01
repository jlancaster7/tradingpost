import React, { ReactElement } from "react";
import { Toggle } from "@ui-kitten/components";
import { Icon, Text } from "@ui-kitten/components";
import { View, Animated } from "react-native"


export function SwitchField(props: any) {
    return <View style={props.viewStyle}>
        <Toggle
            style={props.toggleStyle}
            checked={props.checked}
            onChange={props.onChange} />
        
        <Text style={props.textStyle}>
            {props.label}
        </Text>
    </View> 
    

}

