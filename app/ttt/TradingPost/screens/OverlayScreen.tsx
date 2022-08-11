import { NavigationProp, useNavigation } from "@react-navigation/native"
import React from "react"
import { View, Text, Pressable } from 'react-native'
import { flex, sizes } from "../style"
export const OverlayScreen = () => {
    const nav = useNavigation<NavigationProp<any>>();
    return <View style={[flex, { justifyContent: "center" }]}>
        <Pressable onPress={() => {
            nav.goBack();

        }} style={{ backgroundColor: "white", opacity: 0.85, position: "absolute", height: "100%", width: "100%" }}></Pressable>
        <View style={{ margin: sizes.rem1, padding: sizes.rem1, backgroundColor: "orange" }}>
            <Text>
                FUCK OFF
            </Text>
        </View>
    </View>
}