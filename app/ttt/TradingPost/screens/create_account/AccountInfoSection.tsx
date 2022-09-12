import React, { useState, useRef, useEffect, RefObject, useMemo } from "react";
import { Alert, TouchableOpacity, Image, ImageStyle, ViewStyle, View, Animated } from "react-native";
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
import { Input, Text, } from "@ui-kitten/components";
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
import { ButtonField } from "../../components/ButtonField";
import { IconifyIcon } from "../../components/IconfiyIcon";
import { Section } from "../../components/Section";
import { TextField, ITextField } from "../../components/TextField";
import { bannerText, flex, sizes, textInputWiz } from "../../style";
import { bindTextInput, IEntity, useReadonlyEntity } from "../../utils/hooks";
import { isRequired, isValidEmail, isAlphaNumeric } from "../../utils/validators";

import { ScrollWithButtons } from "../../components/ScrollWithButtons";
import { ProfileBanner } from "../../components/ProfileBanner";
import { Label } from "../../components/Label";
import { TBI } from "../../utils/misc";
import { AppColors } from "../../constants/Colors";
import Auth from '@tradingpost/common/api/entities/static/AuthApi'
import { useAppUser } from "../../Authentication";
import { useData } from "../../lds";
import { useLinkTo } from "@react-navigation/native";
import { CreateAccountProps, useChangeLock, sideMargin } from "./shared";


type FieldRefs = {
    first: RefObject<ITextField>,
    last: RefObject<ITextField>,
    email: RefObject<ITextField>,
    username: RefObject<ITextField>,
    pass: RefObject<ITextField>,
    confirm: RefObject<ITextField>
}
type LoginInfo = { email?: string, password?: string };

export function AccountInfoSection(props: CreateAccountProps) {
    const
        [lockButtons, setLockButtons] = useChangeLock(props),
        //isAuthed = Boolean(props.login), //ensureAuthProps(props),
        isBroken = !useMemo(() => Boolean(props.user.data.first_name), []) || !useMemo(() => Boolean(props.user.data.last_name), []),
        { value: loginResult, setValue: setLoginResult } = useData("loginResult"),
        { appUser } = useAppUser(),
        //isUnconfirmed = isAuthed && !isBroken,
        loginEntity = useReadonlyEntity<LoginInfo>({}),
        linkTo = useLinkTo<any>(),
        refs: FieldRefs = {
            first: useRef<ITextField>(null),
            last: useRef<ITextField>(null),
            email: useRef<ITextField>(null),
            username: useRef<ITextField>(null),
            pass: useRef<ITextField>(null),
            confirm: useRef<ITextField>(null),
        },
        buttonConfig = {
            locked: lockButtons,
            left: (props.saveOnly ? undefined : {
                text: "Cancel",
                onPress: () => {
                    if (props.navigation.canGoBack()) {
                        props.navigation.goBack()
                    }
                    else {
                        linkTo("/login");
                    }
                }
            }),
            right: {
                text: props.saveOnly ? "Apply" : "Create",
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
                        }
                        else if (!false) {  //create new user
                            if (loginEntity.data.email && loginEntity.data.password) {
                                const login = await Auth.createLogin(loginEntity.data.email, loginEntity.data.password);
                                setLoginResult(login);
                                linkTo('/create/basicinfo')
                            }
                            else {
                                throw new Error("Something is very wrong." + JSON.stringify(loginEntity.data))
                            }
                            setLockButtons(false);
                        }
                        else { //patch authed user

                            //await UpdateUserProfile(props.user.data);
                            TBI();
                            props.user.resetData(props.user.data);

                            if (!props.saveOnly)
                                linkTo('/create/basicinfo')

                        }
                    } catch (ex: any) {
                        if (ex.json) {
                            props.toastMessage(`${ex.json.name}:\r\n${ex.json.policy || ex.json.description}`);
                        }
                        else if (typeof ex.message === "string") {
                            props.toastMessage(ex.message);
                        }
                        else props.toastMessage(JSON.stringify(ex.message));
                        setLockButtons(false);
                    }

                }
            }
        }

    useEffect(() => {
        if (props.saveOnly)
            setLockButtons(!props.user.hasChanged);
    }, [props.saveOnly, props.user.hasChanged]);


    return <ScrollWithButtons
        buttons={buttonConfig}>
        {//isUnconfirmed ? <UnverifiedEmail  {...props} />: 
            <AccountBasicInfo refs={refs} isAuthed={false} loginEntity={loginEntity} {...props} />
        }
    </ScrollWithButtons >
}

function AccountBasicInfo(props: CreateAccountProps & { refs: FieldRefs, isAuthed: boolean, loginEntity: IEntity<LoginInfo> }) {
    const { refs, isAuthed } = props,
        opacityAnim = useRef(new Animated.Value(0)).current;

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

    return <View>
        <View style={[flex, { margin: sideMargin }]}>
            <Animated.Text
                style={[bannerText, { opacity: opacityAnim }]}>
                Let's start with some login information
            </Animated.Text>
            {/* <Section title={'Personal Information'}>
                <TextField label='Name'
                    validate={isRequired}
                    errorMessage={"`Name` is required"}
                    textInputRef={refs.first}
                    validateOnChange placeholder='First Name' returnKeyType="none" {...bindTextInput(props.user, "first_name", null)} />
                <TextField
                    label='Last'
                    errorMessage={"`Last Name` is required"}
                    textInputRef={refs.last}
                    validate={isRequired}
                    validateOnChange placeholder='Last Name' returnKeyType="none"  {...bindTextInput(props.user, "last_name", null)} />
            </Section> */}
            {/* <Section title={'Login Information'} > */}
            <TextField
                //label='Email'
                style={textInputWiz}
                textInputRef={refs.email}
                errorMessage={"`Email Address` is invalid"}
                disabled={isAuthed}
                validate={isValidEmail}
                validateOnChange placeholder='Email Address' returnKeyType="none" {...bindTextInput(props.loginEntity, "email", null)}
            />
            {/* <TextField 
                    //label='Username'
                    style={textInputWiz}
                    textInputRef={refs.username}
                    validate={isAlphaNumeric}
                    validateOnChange
                    disabled={isAuthed}
                    errorMessage={"`Username` must be alphanumeric"}
                    placeholder='Account Username' returnKeyType="none" {...bindTextInput(props.user, "handle", null)} /> */}
            {
                isAuthed ?
                    <ButtonField
                        compact
                        isActive
                        label='Password'
                        activeText='Change'
                    />
                    : <>
                        <TextField
                            //label='Password'
                            style={textInputWiz}
                            textInputRef={refs.pass}
                            validate={isRequired}
                            validateOnChange
                            errorMessage={"`Password` is required."}
                            placeholder='Account Password' returnKeyType="none" secureTextEntry
                            {...bindTextInput(props.loginEntity, "password", null)} />
                        <TextField
                            //label='Confirm'
                            style={textInputWiz}
                            textInputRef={refs.confirm}
                            placeholder='Confirm Password'
                            returnKeyType="none"
                            errorMessage={"'Confirm' does not match."}
                            validateOnChange
                            validate={(c) => Boolean(c) && c === props.loginEntity.data.password}
                            secureTextEntry
                        />
                    </>
            }
            {/* </Section> */}
        </View>
    </View >
}

function UnverifiedEmail(props: CreateAccountProps) {
    return <View style={[flex, { margin: sideMargin }]}>
        <View>
            {/* <Text style={{ fontSize:sizes.rem1_5 }}>Email verification is required for:</Text> */}
            <Text style={{ fontSize: sizes.rem1 * 1.25, alignSelf: "center" }} >Please verify your account</Text>
            <View style={{ marginBottom: sizes.rem1, marginTop: sizes.rem1, backgroundColor: "white", borderColor: "#ccc", padding: sizes.rem1, borderWidth: 1, alignSelf: "center", shadowColor: "black", shadowRadius: 10, elevation: 4 }}>
                <Image source={{ uri: props.user.data.profile_url, height: 120, width: 120 }} height={120} width={120} style={{ marginBottom: sizes.rem1 / 2, borderRadius: 60, alignSelf: "center" }} />
                <Text style={{ marginBottom: sizes.rem1 / 2, color: AppColors.primary, fontWeight: "bold", fontSize: sizes.rem1, alignSelf: "center" }} >@{props.user.data.handle}</Text>
                <Text style={{ fontSize: sizes.rem1, alignSelf: "center", color: "black" }} >{props.user.data.display_name}</Text>
            </View>
            <Text style={{ fontSize: sizes.rem1 * 1.25, alignSelf: "center" }} >An email has been sent to:</Text>
            <Text style={{ fontWeight: "bold", fontSize: sizes.rem1 * 1.25, alignSelf: "center" }} >{props.user.data.email}</Text>
        </View>
    </View>
}
