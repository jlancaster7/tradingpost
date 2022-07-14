import React from "react";
import { Text } from "@ui-kitten/components";

export function Label(props: { children?: string }) {
    return <Text style={{
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 7
    }}>{props.children}</Text>
}