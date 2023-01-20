import { View, Animated, ImageStyle, Pressable, ViewStyle } from "react-native";
import React, { useEffect, useRef } from "react";
import { Text, Image } from "react-native";
import { IconifyIcon } from "./IconfiyIcon";
import UserLogo from '../assets/@iconify/user'

import { flex, row, sizes } from "../style";
import { useWindowDimensions } from "react-native";
import { social } from "../images";
//import { ImageResultCallback, openImagePicker } from "../screens/ImagePickerScreen";
import ProfileBg from '../assets/profile/profileBg.png'
import { NavigationProp } from "@react-navigation/native";
import { AppColors } from "../constants/Colors";
import { Interface } from "@tradingpost/common/api";
import { social as socialStyle } from '../style'


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
    return Math.min(dim.width, 680) / bannerAspectRatio + actionPanelSize;
}

const bannerAspectRatio = 21 / 9;//16 / 9;
const viewStyle: ViewStyle = {
    backgroundColor: "lightgray",
    aspectRatio: bannerAspectRatio,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end"
};

type ImageResultCallback = (a: any, b: any) => void;

export function ProfileBanner<T extends boolean>(props: { subscriberCount: number | undefined, profilePic: string | undefined, bannerPic: string | undefined, editMode?: T, collapse?: boolean, extraMarginTop?: number, navigator: NavigationProp<any>, platforms: string[] } &
    (T extends true ? {
        onBannerPicked: ImageResultCallback,
        onProfilePicked: ImageResultCallback

    } : { onBannerPicked?: ImageResultCallback, onProfilePicked?: ImageResultCallback })
) {
    const { profilePic, collapse } = props;

    return <View style={{ alignItems: "center", width: "100%" }}>
        <Pressable
            key="imagepart"

            style={[viewStyle, { backgroundColor: AppColors.primary }, collapse ? { marginTop: actionPanelSize / 2 + (props.extraMarginTop || 0) } : undefined]}
        >
            {/* <Image style={{ width: "100%", height: "100%", position: "absolute" }} source={ProfileBg} /> */}
            {
                /*</> :
                <View style={[row, { backgroundColor: "blue", width: "100%" }]}>
                    <ProfilePic profilePic={profilePic} collapse={collapse} editMode={props.editMode} />
                </View>
                */
            }
        </Pressable>
        {!collapse && <View key="uncollapseFoot" style={[row, {
            width: "100%",
            alignSelf: "stretch",
            height: actionPanelSize,
            backgroundColor: "white",
            alignContent: "center",
            alignItems: "center"
        }]}>
            <Text style={[flex, {
                maxWidth: '48%', // some weird ness here where the  social bar/ this container is weider than the screen so creating a horizontial scroll bar
                textAlign: "center", transform: [{
                    translateX: -profileImageSize / 4,
                }]
            }]}>Subscribers {props.subscriberCount || "-"}</Text>
            <View style={[row, flex, {
                justifyContent: "center",
                height: sizes.rem1_5,
                maxWidth: '50%',
                transform: [{
                    translateX: profileImageSize / 4
                }]
            }]}>
                <SocialBar claims={props.platforms} />
            </View>
        </View>}
        {collapse && <View key="collapseFoot" style={[{
            width: "100%",
            alignSelf: "stretch",
            height: actionPanelSize,
            backgroundColor: "white",
            alignContent: "center",
            alignItems: "center"
        }]}>
            <View style={[row, { height: "100%", alignSelf: "flex-end", marginRight: sizes.rem1 }]}>
                <SocialBar claims={props.platforms} />
            </View>
        </View>}
        <ProfilePic profilePic={profilePic} collapse={collapse} editMode={props.editMode} navigator={props.navigator}
            onProfilePicked={props.onProfilePicked} />
    </View>
}

const SocialBar = (props: { claims: string[] }) => {
    //{social.TwitterLogo, social.LinkedInLogo, social.YouTubeLogo}
    return <>
        {["Twitter", "YouTube", "Spotify", "Substack"].map((logoName, i) => {
            //social.TwitterLogo, social.LinkedInLogo, social.YouTubeLogo
            //social.TwitterLogo, social.LinkedInLogo, social.YouTubeLogo
            const logo = social[logoName + "Logo" as keyof typeof social];
            return props.claims.find((c) => c.toLowerCase() === logoName.toLowerCase()) ?
                <View key={`socialV_${i}`} style={{ height: "100%", aspectRatio: 1 }}>
                    <IconifyIcon key={`social_${i}`} icon={logo} svgProps={{ height: "75%" }}
                        style={{ height: "75%", margin: "12.5%", 
                        aspectRatio: 1 }} 
                        currentColor={logoName === 'Substack' ? socialStyle.substackColor : undefined}
                        />
                </View> : undefined
        })}
    </>
}

function ProfilePic(props: { profilePic: string | undefined, collapse: boolean | undefined, editMode: boolean | undefined, navigator: NavigationProp<any>, onProfilePicked?: ImageResultCallback }) {
    const { profilePic, collapse, editMode } = props;
    const style = collapse ? profileImageSmallStyle : profileImageStyle
    return <Pressable disabled={!editMode} style={style as ViewStyle}
    // onPress={() =>
    //     openImagePicker(props.componentId, {
    //     onImagePicked: props.onProfilePicked,
    //     cropSettings: {
    //         height: 256 * 4,
    //         width: 256 * 4
    //     }
    // })}

    >
        {profilePic ? <Image source={{ uri: profilePic }} style={[style as ImageStyle, { left: 0 }]} /> :
            <IconifyIcon
                style={{ height: "120%", width: "120%", left: "-10%" }}
                icon={UserLogo}
                currentColor='black'
            />}
    </Pressable>
}