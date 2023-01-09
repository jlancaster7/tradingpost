import React from "react"
import { Share, Pressable, ViewStyle } from "react-native"
import ShareIcon from '../assets/@iconify/share'
import { IconifyIcon } from "./IconfiyIcon"

export const ShareButton = (props: { style?: ViewStyle, title: string, url: string, color?: string }) => {
    return <Pressable onPress={() => {
        Share.share({
            title: props.url,
            url: props.url,
            message: props.title

        }, {

        })
    }}>
        <IconifyIcon icon={ShareIcon} style={props.style} currentColor={props.color || "black"} />
    </Pressable>
}