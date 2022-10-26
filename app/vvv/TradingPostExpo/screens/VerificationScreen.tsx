import React, { useEffect } from "react"
import { View } from "react-native"
import { useAppUser } from "../Authentication"
import { PrimaryButton } from "../components/PrimaryButton"
import { SecondaryButton } from "../components/SecondaryButton"
import { ElevatedSection } from "../components/Section"
import { Text } from '@ui-kitten/components'
import { RootStackScreenProps } from "../navigation/pages"
import { Link } from "../components/Link"
import { Api } from '@tradingpost/common/api'
import { useData } from "../lds"
import { ButtonPanel } from "../components/ScrollWithButtons"
import { paddView, sizes } from "../style"


export const VerificationScreen = (props: RootStackScreenProps<"VerifyAccount">) => {
    const { appUser } = useAppUser();
    const { signIn } = useAppUser();
    const { value: authToken, setValue: setAuthToken } = useData("authToken");
    const verificationToken = props.route.params?.token;
    useEffect(()=>{
        if(verificationToken){
            Api.User.extensions.validateUser({
                verificationToken
            })
        }
    },[verificationToken])
    return <View style={paddView}>
        <ElevatedSection title="Verify Your Email">
            <Text style={{ textAlign: "center", paddingVertical: sizes.rem1 }}>{appUser?.email}</Text>
            <ButtonPanel
                left={{
                    onPress: () => {
                        props.navigation.navigate("Dash");
                    },
                    text: "Skip"
                }}
                right={{
                    onPress: () => {
                        //try auth signin
                        if (authToken)
                            signIn("", authToken);
                    },
                    text: "I'm Verified"
                }}
            />
            <Link
                style={{ textAlign: "center", paddingVertical: sizes.rem1 }}
                onPress={() => {
                    Api.User.extensions.sendEmailValidation();
                }}>[Resend Verification Email]</Link>
            <Text>{props.route.params?.token}</Text>
        </ElevatedSection>
    </View>
}