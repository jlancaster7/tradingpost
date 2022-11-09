import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { useAppUser } from "../Authentication"
import { ElevatedSection } from "../components/Section"
import { Text } from '@ui-kitten/components'
import { RootStackScreenProps } from "../navigation/pages"
import { Link } from "../components/Link"
import { Api } from '@tradingpost/common/api'
import { ButtonPanel } from "../components/ScrollWithButtons"
import { paddView, sizes } from "../style"
import { useToast } from "react-native-toast-notifications"
import { useLinkTo } from "@react-navigation/native"


export const VerificationScreen = (props: RootStackScreenProps<"VerifyAccount">) => {
    const { loginState, signIn } = useAppUser();
    const verificationToken = props.route.params?.token;
    const toast = useToast();
    const linkTo = useLinkTo();
    console.log("I'm on the verification screennnn....")
    const [imVerified, setImVerified] = useState(false);
    useEffect(() => {
        if (imVerified) {
            if (loginState?.loginResult?.verified)
                linkTo("/dash/feed");
            else {
                toast.show("You account is still unverified. Please check your email for details.")
                setImVerified(false);
            }
        }
    }, [imVerified, loginState?.loginResult])

    useEffect(() => {
        (async () => {
            if (verificationToken && !loginState?.appUser) {
                if (loginState?.authToken) {
                    try {
                        console.log("SIGNING IN.....");
                        await signIn("", loginState.authToken);
                        setImVerified(true);

                    } catch (ex: any) {
                        console.log(ex.message);
                    }
                } else {
                    console.log("I CANT FIND THE TOKEN.....");
                    props.navigation.replace("Root");
                }
            }
        })()
    }, [
        loginState?.authToken,
        verificationToken, loginState?.appUser
    ])

    useEffect(() => {
        (async () => {

            if (verificationToken && loginState?.appUser) {
                try {

                    await Api.User.extensions.validateUser({
                        verificationToken
                    })
                    if (loginState?.authToken)
                        await signIn("", loginState?.authToken);


                } catch (ex: any) {
                    toast.show(ex.message);
                }
            }
        })()
    }, [verificationToken, toast, loginState?.authToken, loginState?.appUser, imVerified])
    return <View style={paddView}>
        <ElevatedSection title="Verify Your Email">
            <Text style={{ textAlign: "center", paddingVertical: sizes.rem1 }}>{loginState?.appUser?.email}</Text>
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
                        if (loginState?.authToken)
                            await signIn("", loginState?.authToken);
                        setImVerified(true);
                    },
                    text: "I'm Verified"
                }}
            />
            <Link
                style={{ textAlign: "center", paddingVertical: sizes.rem1 }}
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