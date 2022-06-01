
import React, { useEffect } from 'react'
import { Pressable, PressableProps, ViewStyle } from 'react-native'
import { debug } from 'react-native-reanimated';
import { SvgProps, SvgXml } from 'react-native-svg'
import { View } from 'react-native-ui-lib';
// think about just making an image source converter 
interface IIconifyIcon {
    body: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    rotate?: number;
    hFlip?: boolean;
    vFlip?: boolean;
}
export interface IconProps {
    icon: IIconifyIcon,
    style?: ViewStyle,
    svgProps?: SvgProps,
    DEBUG?: boolean,
    // Hack for right now... shoudl htink about this...    
    currentColor?: string
    pressableProps?: Omit<PressableProps, "style">
}

export function IconifyIcon(props: IconProps) {
    useEffect(() => {
        if (props.DEBUG) {
            console.log(JSON.stringify(props.icon));
        }
    }, [props.icon, props.DEBUG])
    const svg = <SvgXml height={"100%"} width={"100%"} xml={`<svg fill="black" width="${props.icon.width || 0}" height="${props.icon.height || 0}" viewBox="0 0 ${props.icon.width || 0} ${props.icon.height || 0}">${props.currentColor ? props.icon.body.replace(/"currentColor"/gi, `"${props.currentColor}"`) : props.icon.body}</svg>`}  {...props.svgProps} />

    return props.pressableProps ?
        <Pressable style={props.style} {...props.pressableProps}>{svg}</Pressable> :
        <View style={props.style} {...props.pressableProps}>{svg}</View>
}