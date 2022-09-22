import { Button } from "@ui-kitten/components";
import React, { useState } from "react";
import { View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { PrimaryButton } from "../components/PrimaryButton";
import { ElevatedSection } from "../components/Section";
import { TextField } from "../components/TextField";
import { DashScreenProps } from "../navigation";
import { Api } from '@tradingpost/common/api'
import { useAppUser } from "../Authentication";

export const ChangePasswordScreen = (props: DashScreenProps<{ token?: string }>) => {
    const
        [oldPass, setOldPass] = useState<string>(),
        [newPass, setNewPass] = useState<string>(),
        [confirm, setConfirm] = useState<string>(),
        toast = useToast(),
        hasToken = Boolean(props.route.params.token),
        appUser = useAppUser()

    return <View>
        <ElevatedSection title={"Reset Password"}>
            {!hasToken && <TextField label="Old Pass" value={oldPass} onChangeText={(t) => setOldPass(t)} />}
            <TextField label="New Pass" value={newPass} onChangeText={(t) => setNewPass(t)} />
            <TextField label="Confirm Pass" value={confirm} onChangeText={(t) => setConfirm(t)} />
            <PrimaryButton
                onPress={async () => {
                    try {
                        if (!hasToken && !oldPass)
                            throw new Error("Please provide a value for your old password");
                        if (newPass && newPass !== confirm)
                            throw new Error("Please make sure your new passwords match")
                        if ((newPass?.length || 0) < 8)
                            throw new Error("Please make sure your password is at least 8 characters long")


                        await Api.Auth.resetPassword(
                            appUser.appUser?.email || "",
                            props.route.params.token || oldPass || "",
                            !hasToken,
                            newPass || "")

                        props.navigation.goBack();

                    }
                    catch (ex: any) {
                        toast.show(ex.message)
                    }

                }}
            >Change Password</PrimaryButton>
        </ElevatedSection>
    </View>

}