import React, { useState } from "react"
import { Text } from '@ui-kitten/components'
import { ButtonField } from "../../components/ButtonField"
import { IconifyIcon, IIconifyIcon } from "../../components/IconfiyIcon"
import { ElevatedSection, Section } from "../../components/Section"
import { bannerText, sizes, thinBannerText, social as socialStyle, paddView } from "../../style"
import { CreateAccountProps, sideMargin } from "../CreateAccountScreen"


//import WebsiteLogo from '@iconify/icons-mdi/web'
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { social } from "../../images"

//import { useIAM } from "../../apis/third-party/twitterApi"
import { View, Alert, Pressable, PressableProps } from "react-native"
import { bindTextInput, useOpacityAnim, useReadonlyEntity } from "../../utils/hooks"
import { TextField } from "../../components/TextField"
import { TBI } from "../../utils/misc"
import { useTwitterAuth } from "../../utils/third-party/twitter"
import { useData } from "../../lds"
//import { claimPlatform, createPlatform, Platform } from "../../apis/UserApi"
//import { AmiraError } from "../../AmiraError"

export function YourContent(props: CreateAccountProps) {
    //const claims = useReadonlyEntity(props.user.data.claims),
    const { AppearView } = useOpacityAnim(),
        [twitterHandle, setTwitterHandle] = useState(props.user.data.claims.find(c => c.platform === "twitter")?.platform_user_id)
    //useEffect(() => {
    //        if (props.saveOnly)
    //      setLockButtons(!broadcastEntity.hasChanged && !notificationEntity.hasChanged);
    //}, [props.saveOnly, broadcastEntity.hasChanged, notificationEntity.hasChanged]);


    const getToken = useTwitterAuth();
    return <ScrollWithButtons
        fillHeight
        buttons={props.saveOnly ? undefined : {
            // left: {
            //     text: 'Not Now',
            //     onPress: props.next
            // },
            right: {
                text: 'Done With Accounts',
                onPress: () => props.next()
            }
        }}
    >
        <AppearView style={[paddView, {alignContent:"center"}]}>
            <ElevatedSection title="Your Content">
                <Text style={thinBannerText}>TradingPost aggregates content across several social platforms.</Text>
                <View style={{ flexDirection: "row", marginHorizontal: sizes.rem2, marginBottom: sizes.rem1 }}>
                    <HandleButton
                        title={twitterHandle}
                        icon={social.TwitterLogo}
                        onPress={() => {
                            getToken().then((handle) => {
                                setTwitterHandle(handle)
                            })
                        }}
                        iconPadd={sizes.rem1}
                    />
                    <HandleButton title="" icon={social.YouTubeLogo} iconPadd={sizes.rem1} />
                </View>
                <View style={{ flexDirection: "row", marginHorizontal: sizes.rem2, marginBottom: sizes.rem1 }}>
                    <HandleButton title="" icon={social.SubstackLogo}
                        iconPadd={sizes.rem1}
                        currentColor={socialStyle.substackColor}
                    />
                    <HandleButton title="" icon={social.SpotifyLogo}
                        iconPadd={sizes.rem0_5}
                    // currentColor={socialStyle.substackColor}
                    />
                </View>
                <Text style={thinBannerText}>Sign in to your account(s) above to claim or add your content.</Text>
            </ElevatedSection>
            {/*             
            <Section title={'Your Content'}>
                <ButtonField
                    label='Twitter'
                    inactiveText='Claim Handle'
                    activeText='Claimed'
                    //isActive={Boolean(props.user.data.claims.twitter)}
                    onPress={async () => {
                        const username = "";
                        // const platform: Platform = {
                        //     platform: "twitter",
                        //     username
                        // }

                        try {
                            //const d = await iam();
                            //platform.username = d.username;//"levert_test_1";
                            //      //const result = await createPlatform(null, [platform]);
                            //                            console.log("RESULTS::" + JSON.stringify(result));
                        }
                        catch (ex) {
                            // if (ex instanceof AmiraError && ex.statusCode === 409) {
                            //     const respBody = (ex.body as { sub_status_code: number, message: string });
                            //     if (respBody.sub_status_code === 0) {
                            //         props.prompt("Husk Account Found", respBody.message,
                            //             [
                            //                 {
                            //                     text: "Cancel", onPress: (dialog) => {
                            //                         dialog.hideDialogView();
                            //                     }
                            //                 },
                            //                 {
                            //                     text: "Claim",
                            //                     onPress: async (dialog) => {
                            //                         try {
                            //                             await claimPlatform(null, [platform])
                            //                             dialog.hideDialogView();
                            //                         }
                            //                         catch (ex: any) {
                            //                             props.toastMessage(ex.message);
                            //                         }
                            //                     }
                            //                 }
                            //             ])
                            //     } else if (respBody.sub_status_code === 1) {
                            //         props.toastMessage(respBody.message);
                            //     }
                            //     else {
                            //         props.toastMessage("Something unexpected went wrong");
                            //     }
                            // }
                            // else
                            console.error(ex);
                        }
                    }
                    }
                    leftElement={(props) => {
                        return <IconifyIcon icon={social.TwitterLogo} style={{ ...props, marginRight: sizes.rem1, }} />
                    }}
                />
                <ButtonField
                    label='YouTube'
                    inactiveText='Claim Channel'
                    activeText='Claimed'
                    //                  isActive={Boolean(props.user.data.claims.youtube)}
                    onPress={() => {
                        props.toastMessage("Invalid Fingerprint");
                    }}
                    leftElement={(props) => {
                        return <IconifyIcon icon={social.YouTubeLogo} style={{ ...props, marginRight: sizes.rem1 }} />
                    }}
                />
                <ButtonField
                    label='Substack'
                    inactiveText='Claim Page'
                    activeText='Claimed'
                    //                isActive={Boolean(props.user.data.claims.substack)}
                    onPress={TBI}
                    leftElement={(props) => {
                        return <IconifyIcon icon={social.SubstackLogo} style={{ ...props, marginRight: sizes.rem1 }} currentColor={socialStyle.substackColor} />
                    }}
                />
                // { <ButtonField
                //     label='LinkedIn'
                //     inactiveText='Claim Profile'
                //     activeText='Claimed'
                //     leftElement={(props) => {
                //         return <IconifyIcon icon={social.LinkedInLogo} style={{ ...props, marginRight: sizes.rem1 }} />
                //     }}
                // /> }
                // { <ButtonField
                //     label='Website'
                //     inactiveText='Claim Site'
                //     activeText='Claimed'
                //     leftElement={(props) => {
                //         return <IconifyIcon icon={WebsiteLogo} style={{ ...props, marginRight: sizes.rem1 }} currentColor='black' />
                //     }}
                /> }
            </Section> */}
        </AppearView>
    </ScrollWithButtons>
}

const HandleButton = (props: { title: string | undefined, icon: IIconifyIcon, currentColor?: string, iconPadd?: number } & Pick<PressableProps, "onPress">) => {
    return <Pressable onPress={props.onPress} style={{ flex: 1, height: sizes.rem8, opacity: props.title ? 1 : 0.25 }}>
        <IconifyIcon icon={props.icon} style={{ width: "100%", flex: 1, justifyContent: "space-around" }} svgProps={{ style: { paddingVertical: props.iconPadd, height: "100%" } }} currentColor={props.currentColor} />
        <Text numberOfLines={1} style={{ fontStyle: !props.title ? "italic" : undefined, color: "black", textAlign: "center" }}>{props.title || "Unclaimed"}</Text>
    </Pressable>
}