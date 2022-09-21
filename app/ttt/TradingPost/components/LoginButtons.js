"use strict";
exports.__esModule = true;
exports.LoginButtons = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
//import { ButtonProps, View } from "react-native-ui-lib";
//import AuthApi from "../api/entities/apis/AuthApi";
//import { screens } from "../layouts/BaseLayout";
//import CreateAccountScreen from "../screens/CreateAccountScreen";
var PrimaryButton_1 = require("./PrimaryButton");
var SecondaryButton_1 = require("./SecondaryButton");
var LoginButtons = function (props) {
    return <react_native_1.View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SecondaryButton_1.SecondaryButton style={{ alignSelf: "center", width: "48%" }} {...props.createAccountProps}>Create Account</SecondaryButton_1.SecondaryButton>
        <PrimaryButton_1.PrimaryButton 
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
    style={{ alignSelf: "center", width: "48%" }} {...props.loginProps}>Sign In</PrimaryButton_1.PrimaryButton>
    </react_native_1.View>;
};
exports.LoginButtons = LoginButtons;
