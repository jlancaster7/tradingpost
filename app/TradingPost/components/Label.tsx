import React from "react";
import { Text } from "react-native-ui-lib";

export function Label(props: { children?: string }) {
    return <Text style={{
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 7
    }}>{props.children}</Text>
}