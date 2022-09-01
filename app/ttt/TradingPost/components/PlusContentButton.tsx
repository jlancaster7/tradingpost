import React from "react"
import { Pressable } from "react-native"
import { shadow } from "../style"
import { IconifyIcon } from "./IconfiyIcon"
import plusCircle from '@iconify/icons-mdi/plus-circle'

/**
 * This component assumes it will be placed in the bottom right corner of its parent.
 * @param props 
 * @returns 
 */
export const PlusContentButton = (props: {
    onPress: () => void
}) => {

    return <Pressable style={[shadow, {
        position: "absolute", bottom: 10, right: 10,
        backgroundColor: "transparent",
        height: 64, aspectRatio: 1,
        borderRadius: 32,
        overflow: "hidden"
    }]} onPress={props.onPress}>
        <IconifyIcon icon={plusCircle} currentColor="green" style={{ height: "120%", top: "-10%", left: "-10%", aspectRatio: 1, margin: 0, padding: 0, backgroundColor: "white" }} svgProps={{
            style: {
                height: "120%"
            }
        }} />
    </Pressable>
}