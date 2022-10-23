import React, { ReactNode } from "react";
import { View, ScrollView, FlatList } from "react-native";
import { AppColors } from "../constants/Colors";

import { flex } from "../style";
import { useIsKeyboardVisible } from "../utils/hooks";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export function VirtualListWithButtons(props: { children?: ReactNode, buttons?: ButtonPanelProps, fillHeight?: boolean }) {
    const { isKeyboardVisible } = useIsKeyboardVisible();
    const listChildren = props.children;
    return <View style={[flex,]} >
        <View style={[flex, { backgroundColor: AppColors.background }]} >
            <FlatList nestedScrollEnabled contentContainerStyle={props.fillHeight ? { maxHeight: "100%", height: "100%"} : {}}
                data={[
                    <View style={[!isKeyboardVisible ? {display: 'flex'} : {display: 'none'}, { height: 0 }]} ></View>,
                    <View>{listChildren}</View>
                ]}
                renderItem={(info) => {
                    return info.item;
                }}
            >
                {/* This is here to force layout of the content. Seems like a but with enxted scrollview content */}
                
                
            </FlatList>
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
