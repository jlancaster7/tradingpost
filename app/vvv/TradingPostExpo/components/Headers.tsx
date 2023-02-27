import React from 'react'
import { TextStyle, ViewStyle } from 'react-native';
import { Text } from "@ui-kitten/components";
import { fonts, sizes } from '../style';
import { AppColors } from '../constants/Colors';

export function Header(props: { text: string, style?: TextStyle }) {
    return <Text
        style={[{ color: AppColors.primary, fontSize: fonts.medium, marginBottom: sizes.rem0_5 }, props.style]}
    >{props.text}{ }</Text>
}


export function Subheader(props: { numberOfLines?: number, text: string, style?: TextStyle }) {
    return <Text
        numberOfLines={props.numberOfLines}
        //color={Colors.primary}
        style={[{ color: AppColors.secondary, fontSize: fonts.small, marginBottom: sizes.rem0_5 }, props.style]}
    >{props.text}{ }</Text>
}