import React from 'react'
import { StyleProp, ViewStyle } from 'react-native';
import { IconNoBg, IconBg } from '../images';

const size = {
    small: 48,
    medium: 128,
    large: 152,
    xLarge: 176,
    xxLarge: 256,
    mega: 320
}
export type LogoImageProps = { style?: StyleProp<ViewStyle>, noBg?: boolean, size?: keyof typeof size }

export function LogoImage(props: LogoImageProps) {
    const iconSize = size[props.size || "small"]
    return props.noBg ?
        <IconNoBg style={props.style} width={iconSize} height={iconSize} />
        : <IconBg style={props.style} width={iconSize} height={iconSize} />
}