import React from 'react'
import { TextStyle, ViewStyle } from 'react-native';
import { Colors, Text } from "react-native-ui-lib";
import { fonts } from '../style';

export function Header(props: { text: string, style?: TextStyle }) {
    return <Text

        color={Colors.secondary}
        style={[{ fontSize: fonts.large, marginBottom: 8 }, props.style]}
    >{props.text}{ }</Text>
}


export function Subheader(props: { text: string, style?: TextStyle }) {
    return <Text
        color={Colors.primary}
        style={[{ fontSize: fonts.small, marginBottom: 8 }, props.style]}
    >{props.text}{ }</Text>
}