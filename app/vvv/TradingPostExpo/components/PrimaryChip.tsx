import React from "react";
import { Button, Icon } from "@ui-kitten/components";
import { AppColors } from "../constants/Colors";
import { sizes } from "../style";
import { GestureResponderEvent, Text, View, ViewStyle } from 'react-native'
import { DeleteButton } from "./AddButton";
export function PrimaryChip(props: { label: string, isAlt?: boolean, style?: ViewStyle, includeX?: boolean, pressEvent?: (event: GestureResponderEvent) => void }) {
    const color = props.isAlt ? AppColors.secondary : AppColors.primary
    return (
        <Button
            key={props.label}
            size={'tiny'}
            onPress={props.pressEvent}
            accessoryLeft={props.includeX ? <Icon
                fill={"#708090"}
                height={20}
                width={20}
                name="close-outline" 
                style={{
                    height: 16,
                    width: 16
                }} /> : undefined}
            style={[{ borderRadius: 16, backgroundColor: color, borderColor: color, marginRight: sizes.rem1 / 4, height: sizes.rem1_5+2, minHeight: sizes.rem1_5+2, paddingVertical: 0 }, props.style, props.includeX ? { paddingRight: 6} : {paddingHorizontal: 6}]}
            >
                <View style={{}}>
                    <Text numberOfLines={1} style={[props.includeX ? {marginLeft: -4} : {}, { color: "white" }]}>{props.label}</Text>
                </View>
            </Button>)
}