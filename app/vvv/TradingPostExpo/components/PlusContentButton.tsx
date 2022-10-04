import React from "react"
import { Pressable } from "react-native"
import { shadow } from "../style"
import { IconifyIcon } from "./IconfiyIcon"
import plusCircle from '../../../../assets/node_modules/@iconify/icons-mdi/plus-circle'
import { AppColors } from "../constants/Colors"

/**
 * This component assumes it will be placed in the bottom right corner of its parent.
 * @param props 
 * @returns 
 */
export const PlusContentButton = (props: {
    onPress: () => void
}) => {

    return <Pressable style={[shadow, {
        position: "absolute", 
        bottom: 10, 
        right: 10,
        backgroundColor: "blue",
        height: 62, aspectRatio: 1,
        borderRadius: 34,
        overflow: "hidden"
    }]} onPress={props.onPress}>
        <IconifyIcon icon={plusCircle} currentColor="green" style={{ height:64*1.2, width:64*1.2,  aspectRatio: 1, margin: 0, padding: 0, backgroundColor:"white" }} svgProps={{
            style: {
                height:64 * 1.2,
                width:64* 1.2,
                marginTop:"-10%",
                marginLeft:"-10%"
            }
        }} />
    </Pressable>
}