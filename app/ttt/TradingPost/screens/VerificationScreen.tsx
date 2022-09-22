import React from "react"
import { View } from "react-native"
import { useAppUser } from "../Authentication"
import { PrimaryButton } from "../components/PrimaryButton"
import { SecondaryButton } from "../components/SecondaryButton"
import { ElevatedSection } from "../components/Section"
import { Text } from '@ui-kitten/components'
export const VerificationScreen = () => {
    const { appUser } = useAppUser()

    return <View>
        <ElevatedSection title="Verify Your Email">
            <Text>{appUser?.email}</Text>
            <PrimaryButton>I'm Verified</PrimaryButton>
            <SecondaryButton>Resend Email</SecondaryButton>
        </ElevatedSection>
    </View>
}