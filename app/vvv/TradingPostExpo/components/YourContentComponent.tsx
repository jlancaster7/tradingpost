import React, { useEffect, useState, useMemo, useRef } from "react"
import { IconifyIcon, IIconifyIcon } from "./IconfiyIcon"
import { ElevatedSection, Section, Subsection } from "./Section"
import { Api } from "@tradingpost/common/api";
import { View, Animated, Pressable, PressableProps } from "react-native"
import { useLinkTo } from "@react-navigation/native"
import { Autocomplete, AutocompleteItem, Icon, IndexPath, Text, TabView, Tab } from "@ui-kitten/components";
import { bannerText, elevated, flex, paddView, paddViewWhite, sizes, thinBannerText, social as socialStyling, fonts } from "../style";
import { useAppUser } from "../Authentication"
import { KeyboardAvoidingInput } from "./KeyboardAvoidingInput";
import { useTwitterAuth } from "../utils/third-party/twitter";
import { social } from "../images";
import { AppColors } from "../constants/Colors";
import { useToast } from "react-native-toast-notifications";
import { useGoogleAuth } from "../utils/third-party/youtube";
import { getCallBackUrl } from "@tradingpost/common/api/entities/static/EntityApiBase";


export function YourContentComponent() {
    const { loginState, signIn } = useAppUser(),
        toast = useToast(),
        [inputMessage, setInputMessage] = useState(''),
        [inputPlatform, setInputPlatform] = useState(''),
        [inputValue, setInputValue] = useState('');

    const appUser = loginState?.appUser;
    const authToken = loginState?.authToken
    const getTwitterToken = useTwitterAuth();
    const getGoogleToken = useGoogleAuth();

    let userClaims = appUser?.claims;

    let [twitterHandle, setTwitterHandle] = useState(userClaims ? userClaims.find(c => c.platform === "twitter")?.claims.handle : '')
    let [substackUsername, setsubstackUsername] = useState(userClaims ? userClaims.find(c => c.platform === "substack")?.claims.handle : '')
    let [spotifyShow, setSpotifyShow] = useState(userClaims ? userClaims.find(c => c.platform === "spotify")?.claims.handle : '')
    let [youtubeChannel, setYoutubeChannel] = useState(userClaims ? userClaims.find(c => c.platform === "youtube")?.claims.handle : '')


    return (
        <ElevatedSection title="" style={{ padding: 5 }}>
            <Text style={[thinBannerText, { fontSize: fonts.medium, lineHeight: fonts.medium * 1.5 }]}>TradingPost aggregates content across several social platforms.</Text>
            <View style={{ flexDirection: "row", marginHorizontal: sizes.rem2, marginBottom: sizes.rem1 }}>
                <HandleButton
                    title={twitterHandle}
                    icon={social.TwitterLogo}
                    onPress={() => {
                        getTwitterToken().then((handle) => {
                            setTwitterHandle(handle)
                        })
                    }}
                    iconPadd={sizes.rem1}
                />
                <HandleButton title={youtubeChannel} icon={social.YouTubeLogo}
                    iconPadd={sizes.rem1}
                    onPress={() => {
                        getGoogleToken().then((handle) => {
                            setYoutubeChannel(handle)
                        })
                        setInputPlatform('youtube')
                        //await Api.User.extensions.linkSocialAccount({platform: 'substack', platform_idenifier: ''}) ;  
                    }}
                />
            </View>
            <View style={{ flexDirection: "row", marginHorizontal: sizes.rem2, marginBottom: sizes.rem1 }}>
                <HandleButton title={substackUsername} icon={social.SubstackLogo}
                    iconPadd={sizes.rem1}
                    currentColor={socialStyling.substackColor}
                    onPress={() => {
                        setInputMessage('Please enter your Substack username as it appears in your profile URL');
                        setInputPlatform('substack')
                        //await Api.User.extensions.linkSocialAccount({platform: 'substack', platform_idenifier: ''}) ;  
                    }}
                />
                <HandleButton title={spotifyShow} icon={social.SpotifyLogo}
                    iconPadd={sizes.rem0_5}
                    onPress={() => {
                        setInputMessage("Please enter your Spotify Podcast's Profile URL.\nIn the Spotify App, this can be found by going to your Podcasts's Profile Page, clicking the 'Share' Icon and clicking 'Copy Link'.");
                        setInputPlatform('spotify')
                        //await Api.User.extensions.linkSocialAccount({platform: 'substack', platform_idenifier: ''}) ;  
                    }}
                />
            </View>
            <Text style={[thinBannerText, { fontSize: fonts.medium, lineHeight: fonts.medium * 1.5 }]}>Sign in to your account(s) above to claim or add your content.</Text>
            <View style={inputPlatform === '' ? { display: 'none' } : { display: 'flex' }}>
                <Text>
                    {inputMessage}
                </Text>
                <KeyboardAvoidingInput
                    placeholder={'Enter here'}
                    value={inputValue}
                    setValue={setInputValue}
                    displayButton={true}
                    numLines={2}
                    rightIcon={(props: any) => <Icon
                        fill={AppColors.secondary}
                        name="plus-square" height={35} width={35} style={{ height: 35, width: 35, padding: 0, alignContent: 'center' }} />}

                    onClick={async (r: any, s: any, t: any) => {
                        const result = await Api.User.extensions.linkSocialAccount({ callbackUrl: getCallBackUrl(), platform: inputPlatform, platform_idenifier: r });
                        if (result === '') {
                            toast.show(`${inputPlatform} Account Link Failed. Please try again or email contact@tradingpostapp.com for assistance.`)
                        }
                        s('')
                        authToken ? await signIn("", authToken) : {};
                    }}
                />
            </View>
        </ElevatedSection>)

}

export const HandleButton = (props: { title: string | undefined, icon: IIconifyIcon, currentColor?: string, iconPadd?: number } & Pick<PressableProps, "onPress">) => {
    return <Pressable onPress={props.onPress} style={{ flex: 1, height: sizes.rem8, opacity: props.title ? 1 : 0.25 }}>
        <IconifyIcon icon={props.icon} style={{ width: "100%", flex: 1, justifyContent: "space-around" }} svgProps={{ style: { paddingVertical: props.iconPadd, height: "100%" } }} currentColor={props.currentColor} />
        <Text numberOfLines={1} style={{ fontStyle: !props.title ? "italic" : undefined, color: "black", textAlign: "center" }}>{props.title || "Unclaimed"}</Text>
    </Pressable>
}