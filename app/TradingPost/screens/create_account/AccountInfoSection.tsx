import React, { useState, useRef, useEffect, RefObject, useMemo } from "react";
import { Alert, ImageStyle, ViewStyle } from "react-native";
import { Navigation } from "react-native-navigation";
import { Colors, Image, Text, TextArea, TouchableOpacity, View } from "react-native-ui-lib";
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
import { ButtonField } from "../../components/ButtonField";
import { IconifyIcon } from "../../components/IconfiyIcon";
import { Section } from "../../components/Section";
import { TextField, ITextField } from "../../components/TextField";
import { flex, sizes } from "../../style";
import { bindTextInput, IEntity, useReadonlyEntity } from "../../utils/hooks";
import { isRequired, isValidEmail, isAlphaNumeric } from "../../utils/validators";
import { CreateAccountProps, sideMargin, useChangeLock } from "../CreateAccountScreen";

import { ScrollWithButtons } from "../../components/ScrollWithButtons";
import { ProfileBanner } from "../../components/ProfileBanner";
import { Label } from "../../components/Label";
import { TBI } from "../../utils/misc";


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
        isAuthed = Boolean(props.login), //ensureAuthProps(props),
        isBroken = !useMemo(() => Boolean(props.user.data.first_name), []) || !useMemo(() => Boolean(props.user.data.last_name), []),
        isUnconfirmed = isAuthed && !isBroken,
        loginEntity = useReadonlyEntity<LoginInfo>({}),
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
            left: isUnconfirmed || isBroken ? {
                text: "Sign Out",
                onPress: async () => {
                    //await signOut();
                    TBI();
                    //Navigation.pop(props.componentId)
                }
            }
                : (props.saveOnly ? undefined : {
                    text: "Cancel",
                    onPress: () => Navigation.pop(props.componentId)
                }),
            right: isUnconfirmed ? {
                text: "I'm Verified",
                onPress: async () => {
                    setLockButtons(true);
                    try {
                        TBI();
                        // const account = await signInStoredCreds();
                        // if (account && !account.status_confirmed)
                        //     props.toastMessage("Verification has not been completed.")

                    }
                    catch (ex) {
                        console.error(ex);
                        props.toastMessage("Error trying to sign in");
                    }
                    setLockButtons(false);
                }
            } : {
                text: props.saveOnly ? "Apply" : "Next",
                onPress: async () => {
                    setLockButtons(true);
                    const errors: string[] = [];
                    try {
                        for (const k in refs) {
                            const val = refs[k as keyof typeof refs];
                            if (val.current && !val.current.field.current?.validate()) {
                                errors.push(val.current.errorMessage || "");
                            }
                        }
                        if (errors.length) {
                            errors.unshift("Please fix the following issues:");
                            props.toastMessage(errors.join("\r\n"));
                            setLockButtons(false);
                        }
                        else if (!isAuthed) {  //create new user
                            Alert.alert("CREATING", "USER DATA")
                            //await CreateAuth0User(props.user.data);
                            TBI();
                            setLockButtons(false);
                        }
                        else { //patch authed user

                            //await UpdateUserProfile(props.user.data);
                            TBI();
                            props.user.resetData(props.user.data);

                            if (!props.saveOnly)
                                props.next();

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
        {isUnconfirmed ? <UnverifiedEmail  {...props} />
            : <AccountBasicInfo refs={refs} isAuthed={isAuthed} loginEntity={loginEntity} {...props} />
        }
    </ScrollWithButtons >
}

function AccountBasicInfo(props: CreateAccountProps & { refs: FieldRefs, isAuthed: boolean, loginEntity: IEntity<LoginInfo> }) {
    const { refs, isAuthed } = props;
    return <View>
        <ProfileBanner profilePic={props.user.data.profile_url} bannerPic={props.user.data.banner_url} editMode componentId={props.componentId}
            onBannerPicked={(img, err) => {
                if (err)
                    props.toastMessage(err.message)
                else if (img) {
                    props.toastMessage("BANNER PICKED");
                    props.user.update({
                        banner_url: `data:${img.mime};base64,${img.data}`
                    })
                }
            }}

            onProfilePicked={(img, err) => {
                console.warn("PROFILE WAS PICKED");
                if (err)
                    props.toastMessage(err.message)
                else if (img) {
                    props.toastMessage("PROFILE PICKED");
                    props.user.update({
                        profile_url: img.data
                    })
                }
            }}

        />
        <View style={[flex, { margin: sideMargin }]}>
            <Section title={'Personal Information'}>
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
                <TextField label='Email'
                    textInputRef={refs.email}
                    errorMessage={"`Email Address` is invalid"}
                    disabled={isAuthed}
                    validate={isValidEmail}
                    validateOnChange placeholder='Email Address' returnKeyType="none" {...bindTextInput(props.user, "email", null)} />
                {/* <TextField
                    label="Website"
                    placeholder="Personal Website Url"
                    {...bindTextInput(props.user, "personalSiteUrl", null)}
                /> */}
                <Label>Your Bio</Label>
                <TextArea
                    numberOfLines={4}
                    placeholder='A breif bio' returnKeyType="none" {...bindTextInput(props.user, "bio", null)} />
            </Section>
            <Section title={'Login Information'} >
                <TextField label='Username'
                    textInputRef={refs.username}
                    validate={isAlphaNumeric}
                    validateOnChange
                    disabled={isAuthed}
                    errorMessage={"`Username` must be alphanumeric"}
                    placeholder='Account Username' returnKeyType="none" {...bindTextInput(props.user, "handle", null)} />
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
                                label='Password'
                                textInputRef={refs.pass}
                                validate={isRequired}
                                validateOnChange
                                errorMessage={"`Password` is required."}
                                placeholder='Account Password' returnKeyType="none" secureTextEntry {...bindTextInput(props.loginEntity, "password", null)} />
                            <TextField label='Confirm'
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
            </Section>
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
                <Text style={{ marginBottom: sizes.rem1 / 2, color: Colors.primary, fontWeight: "bold", fontSize: sizes.rem1, alignSelf: "center" }} >@{props.user.data.handle}</Text>
                <Text style={{ fontSize: sizes.rem1, alignSelf: "center", color: "black" }} >{props.user.data.display_name}</Text>
            </View>
            <Text style={{ fontSize: sizes.rem1 * 1.25, alignSelf: "center" }} >An email has been sent to:</Text>
            <Text style={{ fontWeight: "bold", fontSize: sizes.rem1 * 1.25, alignSelf: "center" }} >{props.user.data.email}</Text>
        </View>
    </View>
}
