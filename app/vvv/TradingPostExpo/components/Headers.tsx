import React from 'react'
import { TextStyle, ViewStyle } from 'react-native';
import { Text } from "@ui-kitten/components";
import { fonts } from '../style';
import { AppColors } from '../constants/Colors';

export function Header(props: { text: string, style?: TextStyle }) {
    return <Text
        style={[{ color: AppColors.primary, fontSize: fonts.large, marginBottom: 8 }, props.style]}
    >{props.text}{ }</Text>
}


export function Subheader(props: { text: string, style?: TextStyle }) {
    return <Text
        //color={Colors.primary}
        style={[{ color:AppColors.secondary, fontSize: fonts.small, marginBottom: 8 }, props.style]}
    >{props.text}{ }</Text>
}