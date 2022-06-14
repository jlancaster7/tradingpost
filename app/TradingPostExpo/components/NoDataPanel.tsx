import React from "react";
import { Text, View } from "react-native-ui-lib";
import { flex, fonts } from "../style";

export function NoDataPanel(props: { message?: string }) {
    return <View style={[flex, { justifyContent: "center", alignContent: "center" }]}>
        <Text style={{ fontSize: fonts.large, color: "lightgray", textAlign: "center" }}>
            {props.message || "No Items"}
        </Text>
    </View>
}