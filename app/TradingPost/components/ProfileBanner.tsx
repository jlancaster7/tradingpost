import { View, Animated, ImageStyle, Pressable, ViewStyle } from "react-native";
import React, { useEffect, useRef } from "react";
import { Text, Image } from "react-native-ui-lib";
import { IconifyIcon } from "./IconfiyIcon";
import UserLogo from '@iconify/icons-mdi/user'
import { flex, row, sizes } from "../style";
import { useWindowDimensions } from "react-native";
import { social } from "../images";
import { ImageResultCallback, openImagePicker } from "../screens/ImagePickerScreen";
import ProfileBg from '../assets/profile/profileBg.png'

export const profileImageSize = sizes.rem6;
export const profileImageSmall = sizes.rem4;
export const actionPanelSize = sizes.rem2;
const profileImageStyle = {
    height: profileImageSize,
    width: profileImageSize,
    position: "absolute",
    borderRadius: profileImageSize / 2,
    backgroundColor: "darkgray",
    bottom: 0
}

const profileImageSmallStyle = {
    height: profileImageSmall,
    width: profileImageSmall,
    borderRadius: profileImageSmall / 2,
    backgroundColor: "darkgray",
    position: "absolute",
    left: sizes.rem1,
    bottom: 0
}


export function useProfileBannerSize() {
    const dim = useWindowDimensions();
    return dim.width / bannerAspectRatio + actionPanelSize;
}

const bannerAspectRatio = 21 / 9;//16 / 9;
const viewStyle: ViewStyle = {
    backgroundColor: "lightgray", aspectRatio: bannerAspectRatio, width: "100%", alignItems: "center", justifyContent: "flex-end"
};



export function ProfileBanner<T extends boolean>(props: { profilePic: string | undefined, bannerPic: string | undefined, editMode?: T, collapse?: boolean, extraMarginTop?: number, componentId: string } &
    (T extends true ? { onBannerPicked: ImageResultCallback,onProfilePicked:ImageResultCallback } : { onBannerPicked?: ImageResultCallback, onProfilePicked?:ImageResultCallback })
) {
    const { profilePic, collapse } = props;

    return <View style={{ alignItems: "center", width: "100%" }}>
        <Pressable
            key="imagepart"
            style={[viewStyle, collapse ? { marginTop: actionPanelSize / 2 + (props.extraMarginTop || 0) } : undefined]}
        >
            <Image style={{ width: "100%", height: "100%", position: "absolute" }} source={ProfileBg} />
            {
                /*</> :
                <View style={[row, { backgroundColor: "blue", width: "100%" }]}>
                    <ProfilePic profilePic={profilePic} collapse={collapse} editMode={props.editMode} />
                </View>
                */
            }
        </Pressable>
        {!collapse && <View key="uncollapseFoot" style={[row, { width: "100%", alignSelf: "stretch", height: actionPanelSize, backgroundColor: "white", alignContent: "center", alignItems: "center" }]}>
            <Text style={[flex, {
                textAlign: "center", transform: [{
                    translateX: - profileImageSize / 4
                }]
            }]} >Subscribers {0}</Text>
            <View style={[row, flex, {
                justifyContent: "center", transform: [{
                    translateX: profileImageSize / 4
                }]
            }]}>
                {[social.TwitterLogo, social.LinkedInLogo, social.YouTubeLogo].map((logo, i) => {
                    return <View style={{ height: "100%", aspectRatio: 1 }}><IconifyIcon key={`social_${i}`} icon={logo} style={{ height: "75%", margin: "12.5%", aspectRatio: 1, }} /></View>
                })}
            </View>
        </View>}
        {collapse && <View key="collapseFoot" style={{ width: "100%", alignSelf: "stretch", height: actionPanelSize / 2, backgroundColor: "white", alignContent: "center", alignItems: "center" }} ></View>}
        <ProfilePic profilePic={profilePic} collapse={collapse} editMode={props.editMode} componentId={props.componentId} onProfilePicked={props.onProfilePicked} />
    </View>
}

function ProfilePic(props: { profilePic: string | undefined, collapse: boolean | undefined, editMode: boolean | undefined, componentId: string, onProfilePicked?: ImageResultCallback }) {
    const { profilePic, collapse, editMode } = props;
    const style = collapse ? profileImageSmallStyle : profileImageStyle
    return <Pressable disabled={!editMode} style={style as ViewStyle}
        onPress={() => openImagePicker(props.componentId, {
            onImagePicked: props.onProfilePicked,
            cropSettings: {
                height: 256 * 4,
                width: 256 * 4
            }
        })}

    >
        {profilePic ? <Image source={{ uri: profilePic }} style={[style as ImageStyle, { left: 0 }]} /> :
            <IconifyIcon
                style={{ height: "120%", width: "120%", left: "-10%" }}
                icon={UserLogo}
                currentColor='black'
            />}
    </Pressable>
}