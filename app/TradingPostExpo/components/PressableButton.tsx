import { Text, ButtonProps, Pressable } from "react-native"
import { AppColors } from "../constants/Colors"

export const PressableButton = (props: ButtonProps & { backgroundColor?: string, outline?: boolean }) => {
    const bgColor = (props.backgroundColor || AppColors.primary)
    return <Pressable
        style={{
            backgroundColor: props.outline ? "#00000000" : bgColor,
            borderColor: props.outline ? props.color : (props.backgroundColor || AppColors.primary),

        }}
        // backgroundColor={Colors.secondary}
        // color={Colors.white}
        {...props} ><Text style={{ color:props.color || "#ffffff"}}>{ props.title}</Text></Pressable >
}