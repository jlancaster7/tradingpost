import { Icon } from "@ui-kitten/components";
import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import { AppColors } from "../constants/Colors";

export const AddButton = (props: Pick<PressableProps, "onPress"> & Pick<ViewStyle, "height" | "width">) => {
    return <Pressable onPress={props.onPress} style={{ justifyContent: "center" }} ><Icon
        //fill={AppColors.secondary}
        fill={AppColors.secondary}
        name="plus-square" style={{
            height: props.height,
            width: props.width
        }} /></Pressable>
}

export const EditButton = (props: Pick<PressableProps, "onPress"> & Pick<ViewStyle, "height" | "width"> & { style?: ViewStyle }) => {
    return <Pressable onPress={props.onPress} style={[{ justifyContent: "center" }, props.style]}><Icon
        //fill={AppColors.secondary}
        fill={"#708090"}
        name="edit-outline" style={{
            height: props.height,
            width: props.width
        }} /></Pressable>
}

export const FavButton = (props: Pick<PressableProps, "onPress"> & Pick<ViewStyle, "height" | "width"> & { isSelected?: boolean }) => {
    return <Pressable onPress={props.onPress} style={{ justifyContent: "center" }}><Icon
        //fill={AppColors.secondary}
        fill={props.isSelected ? "#F6BE00" : "#708090"}
        name={props.isSelected ? "star" : "star-outline"} style={{
            height: props.height,
            width: props.width
        }} /></Pressable>
}
