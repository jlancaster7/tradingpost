import { Button, ButtonGroup as UI_ButtonGroup, ButtonGroupProps, ButtonProps, Text } from "@ui-kitten/components"
import React, {useCallback, useEffect, useState} from "react";
import { Animated, ScrollView, TextStyle, View, Pressable, ViewStyle } from "react-native";
import { sizes } from "../style"

export const TimePeriodButton = <T extends string>(props: {
    value: T | undefined,
    onValueChange: (value: T) => void,
    items: { label: string, value: T }[],
    style?: ViewStyle
}) => {
    return <View style={[{width: "100%", marginBottom: sizes.rem1, flexDirection: 'row',  justifyContent: 'space-around'}, props.style]}>
            {
                props.items.map((v, idx, arr) => {
                    const isSelected = props.value === v.value;
                    return <Pressable onPress={() => props.onValueChange(v.value)}>
                            <View style={{}}>
                                <Text style={[{  fontSize: 14 }, isSelected ? {textDecorationLine: 'underline', color: 'black', fontWeight: '700'} : {color: 'grey'}]}>
                                    {v.label}
                                </Text>
                            </View>
                        </Pressable>
                    
                })
        }
        </View>
    

}