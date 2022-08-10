import React from "react";
import { Colors, Text, TextProps, TouchableOpacity, TouchableOpacityProps } from 'react-native-ui-lib'

export function Link(props: Pick<TouchableOpacityProps, "onPress"> & Pick<TextProps, "style"> & { children: TextProps["children"] }) {
    return <TouchableOpacity onPress={props.onPress}>
        <Text style={props.style} color={Colors.primary}>{props.children}</Text>
    </TouchableOpacity>
}