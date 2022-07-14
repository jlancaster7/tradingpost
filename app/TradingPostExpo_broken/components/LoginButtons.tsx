import { ButtonProps } from "@ui-kitten/components";
import React from "react";
import { Alert, View } from "react-native";
import Animated from "react-native-reanimated";
//import { ButtonProps, View } from "react-native-ui-lib";
//import AuthApi from "../api/entities/apis/AuthApi";

//import { screens } from "../layouts/BaseLayout";
//import CreateAccountScreen from "../screens/CreateAccountScreen";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export const LoginButtons = (props: { createAccountProps: Partial<ButtonProps>, loginProps: Partial<ButtonProps> }) => {
    return <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SecondaryButton style={{ alignSelf: "center", width: "48%" }} 
            {...props.createAccountProps}
        //onPress={() => {
        //  screens.push(componentId, "CreateAccount")

        //}}
        //disabled={loggingIn}
        >Create Account</SecondaryButton>
        <PrimaryButton
         
            //disabled={loggingIn}
            // onPress={async () => {

            //   //  setLoggingIn(true);
            //     // try {
            //     //     const val = userRef.current?.field.current?.validate();
            //     //     const passVal = passRef.current?.field.current?.validate();
            //     //     if (val && passVal) {
            //     //         const user = await AuthApi.login(username, password);// signInWithPassword(username, password);

            //     //         if (user.verified)
            //     //             Alert.alert("VERIFIED")
            //     //         //SetDashboardLayout();
            //     //         else
            //     //             screens.push(componentId, "CreateAccount")




            //     //         // Navigation.push(props.componentId, {
            //     //         //     component: screens.getComponent("App")
            //     //         // });
            //     //     }
            //     //     else
            //     //         throw new Error(userRef.current?.errorMessage)
            //     // }
            //     // catch (ex: any) {
            //     //     passRef.current?.field.current?.clear();
            //     //     dashboardRef.current?.toastMessage(ex.message);
            //     // }
            //     // finally {
            //     //     setLoggingIn(false);
            //     // }

            // }}
            style={{ alignSelf: "center", width: "48%" }}
            {...props.loginProps}
        >Sign In</PrimaryButton>
    </View>
}