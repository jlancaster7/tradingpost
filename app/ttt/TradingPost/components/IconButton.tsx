import React from "react";
import { Image, ImageBackground, ImageStyle } from "react-native";
import { sizes } from "../style";

export function IconButton(props: { iconSource: number, style?: ImageStyle }) {
    return <Image source={props.iconSource} resizeMode="contain" style={[ {height:24}, props.style]}/>
} 