import React, { useEffect, useRef, useState } from 'react'
import { Alert, Text, TextInput, Animated, ScaleTransform, ScaleYTransform, View } from "react-native";
import { ITextField, TextField } from '../components/TextField';
import { LogoImage } from '../components/LogoImage';
//import { BaseScreen, BaseScreenProps, IDashboard, screens } from '../layouts/BaseLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import { AltSecondaryButton, SecondaryButton } from '../components/SecondaryButton';
//import { Incubator, View } from 'react-native-ui-lib';
import { Link } from '../components/Link';
//import { Navigation } from 'react-native-navigation';
//import { useIsKeyboardVisible/*, useToast*/ } from '../utils/hooks';
import { isRequired, isValidEmail } from '../utils/validators';
import { paddView, sizes } from '../style';
//import AuthApi from '../api/entities/apis/AuthApi';
import { AppTitle, IconBg, IconNoBg } from '../images'
//import { Screen } from './BaseScreen';

//import { resetPassword, signInWithPassword } from '../apis/Authentication';
//import { ToastProps } from 'react-native-ui-lib/typings';

export default () => {
    const
        userRef = useRef<ITextField>(null),
        passRef = useRef<ITextField>(null),
        [username, setUsername] = useState<string>(''),
        [password, setPassword] = useState<string>(''),
        [loggingIn, setLoggingIn] = useState(false),
        //{ isKeyboardVisible } = useIsKeyboardVisible(),
        //  { toastMessage, toastProps } = useToast(),
        [resetMode, setResetMode] = useState(false)
    //dashboardRef = useRef<IDashboard>()

    const scaleHeader = useRef(new Animated.Value(1)).current;
    return <View
        style={paddView}
    ><Animated.View style={{
        alignItems: "center",
        transform: [{
            scaleY: scaleHeader
        }]
    }}>
            <IconBg height={256} width={256} />
            <AppTitle />
        </Animated.View>
        <TextField label='Username' placeholder='TradingPost Username' returnKeyType="next"
            onChangeText={(name) => setUsername(name)}
            //validateOnChange
            textInputRef={userRef}
        //validate={isValidEmail}
        //errorMessage={"Invalid Email Address"}
        //validateOnChange
        //onSubmitEditing={() => passRef.current?.focus()}
        //error={userError}
        />
        {
            !resetMode && <>
                <TextField
                    //containerStyle={{ height: 64 }}
                    label='Password'
                    //validate={isRequired}
                    onChangeText={(pass) => setPassword(pass)}
                    placeholder='TradingPost Password'
                    //errorMessage="Invalid Password"
                    //validateOnChange
                    secureTextEntry textInputRef={passRef} />
                <Link style={{ paddingTop: 4, paddingBottom: 16, alignSelf: "flex-end" }} onPress={() => setResetMode(true)}>Forgot Password?</Link>

            </>
        }
        {
            resetMode &&
            <PrimaryButton
                disabled={loggingIn}
                onPress={async () => {
                    setLoggingIn(true)
                    try {
                        //          await resetPassword(username);
                    }
                    catch (ex) {
                        //We should always say an email is sent for now.
                    }
                    finally {
                        //    dashboardRef.current?.toastMessage("Reset email has been sent.")
                        setLoggingIn(false);
                        setResetMode(false);
                    }
                }}>Reset Password</PrimaryButton>


        }


        <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 8, marginTop: "auto", minHeight: 30 }} >
            <Link>Privacy Policy</Link>
            <Link>Terms Of Use</Link>
        </View>
    </View>
}






