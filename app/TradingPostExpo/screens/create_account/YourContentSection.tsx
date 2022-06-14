import React from "react"

import { ButtonField } from "../../components/ButtonField"
import { IconifyIcon } from "../../components/IconfiyIcon"
import { Section } from "../../components/Section"
import { sizes } from "../../style"
import { CreateAccountProps, sideMargin } from "../CreateAccountScreen"


//import WebsiteLogo from '@iconify/icons-mdi/web'
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { social } from "../../images"
import { social as socialStyle } from '../../style'
//import { useIAM } from "../../apis/third-party/twitterApi"
import { View, Alert } from "react-native"
import { bindTextInput, useReadonlyEntity } from "../../utils/hooks"
import { TextField } from "../../components/TextField"
import { TBI } from "../../utils/misc"
//import { claimPlatform, createPlatform, Platform } from "../../apis/UserApi"
//import { AmiraError } from "../../AmiraError"


export function YourContent(props: CreateAccountProps) {

    const claims = useReadonlyEntity(props.user.data.claims);

    //useEffect(() => {
    //        if (props.saveOnly)
    //      setLockButtons(!broadcastEntity.hasChanged && !notificationEntity.hasChanged);
    //}, [props.saveOnly, broadcastEntity.hasChanged, notificationEntity.hasChanged]);


    //const iam = useIAM();
    return <ScrollWithButtons

        buttons={props.saveOnly ? undefined : {
            left: {
                text: 'Not Now',
                onPress: props.next
            },
            right: {
                text: 'Continue',
                onPress: props.next
            }
        }}
    >
        <View style={{ margin: sideMargin }}>
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
                        return <IconifyIcon DEBUG icon={social.SubstackLogo} style={{ ...props, marginRight: sizes.rem1 }} currentColor={socialStyle.substackColor} />
                    }}
                />
                {/* <ButtonField
                    label='LinkedIn'
                    inactiveText='Claim Profile'
                    activeText='Claimed'
                    leftElement={(props) => {
                        return <IconifyIcon icon={social.LinkedInLogo} style={{ ...props, marginRight: sizes.rem1 }} />
                    }}
                /> */}
                {/* <ButtonField
                    label='Website'
                    inactiveText='Claim Site'
                    activeText='Claimed'
                    leftElement={(props) => {
                        return <IconifyIcon icon={WebsiteLogo} style={{ ...props, marginRight: sizes.rem1 }} currentColor='black' />
                    }}
                /> */}
            </Section>
        </View>
    </ScrollWithButtons>
}

