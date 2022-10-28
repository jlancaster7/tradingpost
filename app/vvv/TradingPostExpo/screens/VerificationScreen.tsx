import React, {useEffect, useState} from "react"
import {View} from "react-native"
import {useAppUser} from "../Authentication"
import {PrimaryButton} from "../components/PrimaryButton"
import {SecondaryButton} from "../components/SecondaryButton"
import {ElevatedSection} from "../components/Section"
import {Text} from '@ui-kitten/components'
import {RootStackScreenProps} from "../navigation/pages"
import {Link} from "../components/Link"
import {Api} from '@tradingpost/common/api'
import {useData} from "../lds"
import {ButtonPanel} from "../components/ScrollWithButtons"
import {paddView, sizes} from "../style"
import {useToast} from "react-native-toast-notifications"
import {useLinkTo} from "@react-navigation/native"


export const VerificationScreen = (props: RootStackScreenProps<"VerifyAccount">) => {
    const {appUser, loginResult} = useAppUser();
    const {signIn, isSignInComplete} = useAppUser();
    const {value: authToken, setValue: setAuthToken} = useData("authToken");
    const verificationToken = props.route.params?.token;
    const toast = useToast();
    const linkTo = useLinkTo();
    const [imVerified, setImVerified] = useState(false);
    useEffect(() => {
        if (imVerified) {
            if (loginResult?.verified)
                linkTo("/dash/feed");
            else {
                toast.show("You account is still unverified. Please check your email for details.")
                setImVerified(false);
            }
        }
    }, [imVerified, loginResult])

    useEffect(() => {
        (async () => {
            if (verificationToken && !appUser) {
                if (authToken) {
                    try {
                        console.log("SIGNING IN.....");
                        await signIn("", authToken);
                        setImVerified(true);

                    } catch (ex: any) {
                        console.log(ex.message);
                    }
                } else {
                    console.log("I CANT FIND THE TOKEN.....");
                    props.navigation.navigate("Login");
                }
            }
        })()
    }, [
        authToken,
        verificationToken, appUser
    ])

    useEffect(() => {
        (async () => {
            if (verificationToken && appUser) {
                try {
                    await Api.User.extensions.validateUser({
                        verificationToken
                    })
                    if (authToken)
                        await signIn("", authToken);


                } catch (ex: any) {
                    toast.show(ex.message);
                }
            }
        })()
    }, [verificationToken, toast, authToken, appUser, isSignInComplete, imVerified])
    return <View style={paddView}>
        <ElevatedSection title="Verify Your Email">
            <Text style={{textAlign: "center", paddingVertical: sizes.rem1}}>{appUser?.email}</Text>
            <ButtonPanel
                left={{
                    onPress: () => {
                        linkTo("/dash/feed")
                        //props.navigation.navigate("Dash");
                    },
                    text: "Skip"
                }}
                right={{
                    onPress: async () => {
                        //try auth signin
                        if (authToken)
                            await signIn("", authToken);
                        setImVerified(true);
                    },
                    text: "I'm Verified"
                }}
            />
            <Link
                style={{textAlign: "center", paddingVertical: sizes.rem1}}
                onPress={async () => {
                    try {
                        await Api.User.extensions.sendEmailValidation();
                        toast.show("Verification Email has been sent")
                    } catch (ex: any) {
                        console.log(ex.message);
                    }
                }}>[Resend Verification Email]</Link>
            <Text>{props.route.params?.token}</Text>
        </ElevatedSection>
    </View>
}