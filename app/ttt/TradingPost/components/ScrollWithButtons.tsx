import React, { ReactNode } from "react";
import { View, ScrollView } from "react-native";
import { AppColors } from "../constants/Colors";

import { flex } from "../style";
import { useIsKeyboardVisible } from "../utils/hooks";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export function ScrollWithButtons(props: { children?: ReactNode, buttons?: ButtonPanelProps, fillHeight?: boolean }) {
    const { isKeyboardVisible } = useIsKeyboardVisible();
    return <View style={[flex,]} >
        <View style={[flex, { backgroundColor: AppColors.background }]} >
            <ScrollView nestedScrollEnabled contentContainerStyle={[{ maxHeight: "100%", height: props.fillHeight ? "100%" : undefined }]}>
                {/* This is here to force layout of the content. Seems like a but with enxted scrollview content */}
                {!isKeyboardVisible && <View style={{ height: 0 }} ></View>}
                {props.children}
            </ScrollView>
        </View>
        {props.buttons && <ButtonPanel {...props.buttons} />}
    </View>
}

export type ButtonPanelProps = {
    locked?: boolean,
    left?: {
        text: string,
        onPress: () => void
    },
    right: {
        text: string,
        onPress: () => void
    }
}
export function ButtonPanel(props: ButtonPanelProps) {
    return <View style={[{ borderTopColor: "#ccc", borderTopWidth: 1, flexDirection: "row", 
    paddingTop: 8,
     paddingBottom: 8, 
     
     justifyContent: "space-evenly", zIndex: 1000 }]}>
        {props.left && <SecondaryButton style={{ width: "48%" }} onPress={props.left.onPress} disabled={props.locked} >{props.left.text}</SecondaryButton>}
        <PrimaryButton style={{ width: props.left ? "48%" : "96%" }} onPress={props.right.onPress} disabled={props.locked} >{props.right.text}</PrimaryButton>
    </View>
}
