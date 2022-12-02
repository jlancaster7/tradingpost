import React, { useState, useRef, useEffect, RefObject, useMemo } from "react";
import { Alert, TouchableOpacity, Image, ImageStyle, ViewStyle, View, Animated } from "react-native";
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
import { CheckBox, Input, Text, } from "@ui-kitten/components";
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
import { ButtonField } from "../../components/ButtonField";
import { IconifyIcon } from "../../components/IconfiyIcon";
import { Section } from "../../components/Section";
import { TextField, ITextField } from "../../components/TextField";
import { bannerText, flex, sizes, textInputWiz } from "../../style";
import { bindTextInput, IEntity, useReadonlyEntity } from "../../utils/hooks";
import { isRequired, isValidEmail, isAlphaNumeric } from "../../utils/validators";
import { CreateAccountProps, sideMargin } from "./shared";

import { ScrollWithButtons } from "../../components/ScrollWithButtons";
import { useData } from "../../lds";
import { Label } from "../../components/Label";
import { TBI } from "../../utils/misc";
import { AppColors } from "../../constants/Colors";
import Auth from '@tradingpost/common/api/entities/static/AuthApi'
import UserApi from '@tradingpost/common/api/entities/apis/UserApi'
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { useAppUser } from "../../Authentication";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import { registerDeviceForNotifications } from "../../utils/notifications";
import { Link } from "../../components/Link";


type FieldRefs = {
    first: RefObject<ITextField>,
    last: RefObject<ITextField>,
    username: RefObject<ITextField>
}

export function BasicInfoSection(props: CreateAccountProps) {
    const
        nav = useNavigation(),
        [lockButtons, setLockButtons] = useState(false),
        opacityAnim = useRef(new Animated.Value(0)).current,
        { signIn, loginState } = useAppUser(),
        appUser = loginState?.appUser,
        [agreeToTerms, setAgreeToTerms] = useState(false),
        [agreeToPrivacy, setAgrreeToPrivacy] = useState(false),
        refs: FieldRefs = {
            first: useRef<ITextField>(null),
            last: useRef<ITextField>(null),
            username: useRef<ITextField>(null),
        },
        linkTo = useLinkTo<any>(),
        { value: firstTime, setValue: setFirstTime } = useData('firstTime'),
        buttonConfig = {
            locked: lockButtons,
            left: {
                text: "Sign Out",
                onPress: async () => {
                    Auth.signOut();
                    nav.goBack();
                }
            }
            // : (props.saveOnly ? undefined : {
            //     text: "Cancel",
            //     onPress: () => props.navigation.goBack()//Navigation.pop(props.componentId)
            // })
            ,
            right: {
                text: "Next",
                onPress: async () => {
                    setLockButtons(true);
                    const errors: string[] = [];
                    try {
                        for (const k in refs) {
                            const val = refs[k as keyof typeof refs];
                            if (val.current && !val.current.validate()) {
                                errors.push(val.current.errorMessage || "");
                            }
                        }
                        if (errors.length) {

                            errors.unshift("Please fix the following issues:");
                            props.toastMessage(errors.join("\r\n"));

                            setLockButtons(false);
                        } else {
                            setFirstTime(true);
                            const { token } = await Auth.createUser(props.user.data.first_name, props.user.data.last_name, props.user.data.handle);
                            await signIn("", token);
                            await registerDeviceForNotifications();
                            linkTo('/create/watchlist')
                            //props.next();                            
                            //props.navigation.navigate("Root");
                            //setLockButtons(false);
                        }

                    } catch (ex: any) {
                        if (ex.json) {
                            props.toastMessage(`${ex.json.name}:\r\n${ex.json.policy || ex.json.description}`);
                        } else if (typeof ex.message === "string") {
                            props.toastMessage(ex.message);
                        } else props.toastMessage(JSON.stringify(ex.message));
                        setLockButtons(false);
                    }

                }
            }
        }

    useEffect(() => {
        Animated.timing(
            opacityAnim,
            {
                delay: 0.75,
                toValue: 1,
                duration: 2000,
                useNativeDriver: true
            }).start();
    }, [])


    return <ScrollWithButtons
        buttons={buttonConfig}>
        <View>
            <View style={[flex, { margin: sideMargin }]}>
                <Animated.Text
                    style={[bannerText, { opacity: opacityAnim }]}>
                    Let's keep setting up your account
                </Animated.Text>
                <TextField
                    style={textInputWiz}
                    textInputRef={refs.first}
                    errorMessage={"`First Name` is required"}
                    validate={isRequired}
                    validateOnChange placeholder='First Name'
                    returnKeyType="none" {...bindTextInput(props.user, "first_name", null)}
                />
                <TextField
                    style={textInputWiz}
                    textInputRef={refs.last}
                    errorMessage={"`Last Name` is required"}
                    validate={isRequired}
                    validateOnChange placeholder='Last Name'
                    returnKeyType="none" {...bindTextInput(props.user, "last_name", null)}
                />
                <TextField
                    style={textInputWiz}
                    textInputRef={refs.username}
                    errorMessage={"`Username` is required"}
                    validate={isRequired}
                    validateOnChange placeholder='Username'
                    returnKeyType="none" {...bindTextInput(props.user, "handle", null)}
                />
            </View>
        </View>
    </ScrollWithButtons>
}
