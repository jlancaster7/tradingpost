import React, { useRef, useState } from 'react'
import { Alert, Text, TextInput } from "react-native";
import { ITextField, TextField } from '../components/TextField';
import { LogoImage } from '../components/LogoImage';
import { BaseScreen, IDashboard, screens } from '../layouts/BaseLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import { AltSecondaryButton, SecondaryButton } from '../components/SecondaryButton';
import { Incubator, View } from 'react-native-ui-lib';
import { Link } from '../components/Link';
import { Navigation } from 'react-native-navigation';
import { useIsKeyboardVisible, useToast } from '../utils/hooks';
import { isRequired, isValidEmail } from '../utils/validators';
import { sizes } from '../style';
import AuthApi from '../api/entities/apis/AuthApi';
//import { resetPassword, signInWithPassword } from '../apis/Authentication';
//import { ToastProps } from 'react-native-ui-lib/typings';



export function LoginScreen(props: { componentId: string }) {
    const
        userRef = useRef<ITextField>(null),
        passRef = useRef<ITextField>(null),
        [username, setUsername] = useState<string>(''),
        [password, setPassword] = useState<string>(''),
        [loggingIn, setLoggingIn] = useState(false),
        { componentId } = props,
        { isKeyboardVisible } = useIsKeyboardVisible(),
        //  { toastMessage, toastProps } = useToast(),
        [resetMode, setResetMode] = useState(false),
        dashboardRef = useRef<IDashboard>()




    return <BaseScreen dashboardRef={dashboardRef} viewStyle={{ marginLeft: sizes.rem1_5, marginRight: sizes.rem1_5 }} scrollContentFlex={!isKeyboardVisible}
    //toast={toastProps}
    >
        <TextField label='Username' placeholder='TradingPost Username' returnKeyType="next"
            onChangeText={(name) => setUsername(name)}
            validateOnChange
            textInputRef={userRef}
            validate={isValidEmail}
            errorMessage={"Invalid Email Address"}
        //validateOnChange
        //onSubmitEditing={() => passRef.current?.focus()}
        //error={userError}
        />
        {!resetMode && <>
            <TextField
                containerStyle={{ height: 64 }}
                label='Password' validate={isRequired}
                onChangeText={(pass) => setPassword(pass)}
                placeholder='TradingPost Password'
                errorMessage="Invalid Password"
                validateOnChange
                secureTextEntry textInputRef={passRef} />
            <Link style={{ paddingTop: 4, paddingBottom: 16, alignSelf: "flex-end" }} onPress={() => setResetMode(true)}>Forgot Password?</Link>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <SecondaryButton style={{ alignSelf: "center", width: "48%" }} label="Create Account"
                    onPress={() => screens.push(componentId, "CreateAccount")}
                    disabled={loggingIn}
                />
                <PrimaryButton
                    label="Log In"
                    disabled={loggingIn}
                    onPress={async () => {
                        setLoggingIn(true);
                        try {
                            const val = userRef.current?.field.current?.validate();
                            const passVal = passRef.current?.field.current?.validate();
                            if (val && passVal) {
                                const user = await AuthApi.login(username, password);// signInWithPassword(username, password);

                                if (user.verified)
                                    Alert.alert("VERIFIED")
                                //SetDashboardLayout();
                                else
                                    screens.push(componentId, "CreateAccount")


                                // Navigation.push(props.componentId, {
                                //     component: screens.getComponent("App")
                                // });
                            }
                            else
                                throw new Error(userRef.current?.errorMessage)
                        }
                        catch (ex: any) {
                            passRef.current?.field.current?.clear();
                            dashboardRef.current?.toastMessage(ex.message);
                        }
                        finally {
                            setLoggingIn(false);
                        }

                    }}
                    style={{ alignSelf: "center", width: "48%" }} />
            </View>
        </>
        }
        {resetMode &&
            <PrimaryButton
                disabled={loggingIn}
                label='Reset Password'
                onPress={async () => {
                    setLoggingIn(true)
                    try {
                        //          await resetPassword(username);
                    }
                    catch (ex) {
                        //We should always say an email is sent for now.
                    }
                    finally {
                        dashboardRef.current?.toastMessage("Reset email has been sent.")
                        setLoggingIn(false);
                        setResetMode(false);
                    }
                }}
            />


        }


        <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 8, marginTop: "auto", minHeight: 30 }} >
            <Link>Privacy Policy</Link>
            <Link>Terms Of Use</Link>
        </View>
    </BaseScreen>
}