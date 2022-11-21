import {NavigationProp, useNavigation} from "@react-navigation/native"
import {Interface} from "@tradingpost/common/api"
import {Avatar, Text} from "@ui-kitten/components"
import React from "react"
import {Pressable, View, ViewStyle} from "react-native"
import {flex, sizes} from "../style"
import {ProfileButton} from "./ProfileButton"

export const ProfileBar = (props: {
    user?: Interface.IUserList,
    style?: ViewStyle
}) => {
    const nav = useNavigation<NavigationProp<any>>();
    const openProfile = () => {
        if (props.user?.id) {
            nav.navigate("Profile", {
                userId: props.user.id
            });
        }
    }

    return <View style={props.style}><View style={{flexDirection: "row", width: "100%", marginBottom: sizes.rem0_5}}>
        <ProfileButton userId={props.user?.id || ""} profileUrl={props.user?.profile_url || ""} size={sizes.rem2}/>
        <View style={[flex, {marginLeft: sizes.rem0_5, justifyContent: 'center', alignItems: 'center'}]}>
            <Pressable style={props.user?.display_name.length && props.user?.display_name.length > 1 ? {display: 'flex'} : {display: 'none'}} onPress={openProfile}><Text category={"s1"}>{props.user?.display_name}</Text></Pressable>
            <Pressable onPress={openProfile}><Text category={"s2"}>{"@" + props.user?.handle}</Text></Pressable>
        </View>
    </View>
    </View>
}