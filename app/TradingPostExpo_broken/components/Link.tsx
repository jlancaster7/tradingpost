import React from "react";
import { Pressable, PressableProps, Text, TextProps } from "react-native";
import { AppColors } from "../constants/Colors";
//import { Colors, Text, TextProps, TouchableOpacity, TouchableOpacityProps } from 'react-native-ui-lib'

export function Link(props: Pick<PressableProps, "onPress"> & Pick<TextProps, "style" | "children">) {
    return <Pressable onPress={props.onPress}>
        <Text style={[{ color: AppColors.primary }, props.style]}>{props.children}</Text>
    </Pressable>
}