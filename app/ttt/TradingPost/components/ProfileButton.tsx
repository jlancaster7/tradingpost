
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Icon } from "@ui-kitten/components"
import React from "react"
import { Pressable, Image } from "react-native"
import { AppColors } from "../constants/Colors"
import { sizes } from "../style"

export const ProfileButton = (props: { userId: string, profileUrl: string, size: number, editable?: boolean }) => {
    const nav = useNavigation<NavigationProp<any>>();

    return <Pressable
        onPress={props.editable ? async () => {
            nav.navigate("ImagePicker");
        } : () => {
            if (props.userId)
                nav.navigate("Profile", {
                    userId: props.userId
                });
        }}
        style={{
            backgroundColor: "gray",
            width: props.size,
            height: props.size,
            borderRadius: props.size / 2,
            alignSelf: "center",
            borderWidth: props.size / 32,
            borderColor: "#ccc",
            overflow: "hidden"
        }}>
        {props.profileUrl ? <Image style={{ height: "100%", width: "100%" }} source={{ uri: props.profileUrl }} /> : <Icon height={"100%"} width={"100%"} name="person" />}
    </Pressable>
}