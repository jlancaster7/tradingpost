import React, { useRef, useEffect, RefObject, useMemo, useState } from "react";
import { Image, View, Animated } from "react-native";
import { CheckBox, Text } from "@ui-kitten/components";
import { ButtonField } from "../../components/ButtonField";
import { TextField, ITextField } from "../../components/TextField";
import { bannerText, flex, sizes, textInputWiz } from "../../style";
import { bindTextInput, IEntity, useReadonlyEntity } from "../../utils/hooks";
import { isRequired, isValidEmail } from "../../utils/validators";

import { ScrollWithButtons } from "../../components/ScrollWithButtons";

import { TBI } from "../../utils/misc";
import { AppColors } from "../../constants/Colors";
import Auth from '@tradingpost/common/api/entities/static/AuthApi'
import { useAppUser } from "../../Authentication";
import { useData } from "../../lds";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import { CreateAccountProps, sideMargin } from "./shared";
import { Link } from "../../components/Link";


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
        [lockButtons, setLockButtons] = useState(false),
        { setValue: setLoginResult } = useData("loginResult"),
        loginEntity = useReadonlyEntity<LoginInfo>({}),
        linkTo = useLinkTo<any>(),
        nav = useNavigation(),
        [agreeToTerms, setAgreeToTerms] = useState(false),
        [agreeToPrivacy, setAgrreeToPrivacy] = useState(false),
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
            left: ({
                text: "Cancel",
                onPress: () => {
                    if (nav.canGoBack()) {
                        nav.goBack()
                    } else {
                        linkTo({
                            screen: "/login"
                        });
                    }
                }
            }),
            right: {
                text: "Create",
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
                        if (!agreeToPrivacy || !agreeToTerms) {
                            errors.push("You must agree to terms and privacy policy");
                        }

                        if (errors.length) {
                            errors.unshift("Please fix the following issues:");
                            props.toastMessage(errors.join("\r\n"));
                            setLockButtons(false);
                        } else if (!false) {  //create new user
                            if (loginEntity.data.email && loginEntity.data.password) {
                                const login = await Auth.createLogin(loginEntity.data.email, loginEntity.data.password);
                                await setLoginResult(login);
                                linkTo('/create/basicinfo')
                            } else {
                                throw new Error("Something is very wrong." + JSON.stringify(loginEntity.data))
                            }
                            setLockButtons(false);
                        } else { //patch authed user

                            //await UpdateUserProfile(props.user.data);
                            TBI();
                            props.user.resetData(props.user.data);
                            linkTo('/create/basicinfo')
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

    return <ScrollWithButtons
        buttons={buttonConfig}>
        {
            <AccountBasicInfo agreeToPrivacy={agreeToPrivacy} setAgreeToPrivacy={setAgrreeToPrivacy} agreeToTerms={agreeToTerms} setAgreeToTerms={setAgreeToTerms} refs={refs} isAuthed={false} loginEntity={loginEntity} {...props} />
        }
    </ScrollWithButtons>
}

function AccountBasicInfo(props: CreateAccountProps & { refs: FieldRefs, isAuthed: boolean, loginEntity: IEntity<LoginInfo>, agreeToTerms: boolean, setAgreeToTerms: (a: boolean) => void, agreeToPrivacy: boolean, setAgreeToPrivacy: (a: boolean) => void }) {
    const { refs, isAuthed } = props,
        opacityAnim = useRef(new Animated.Value(0)).current,
        { agreeToTerms, setAgreeToTerms, agreeToPrivacy, setAgreeToPrivacy } = props,
        linkTo = useLinkTo<any>();
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
                validateOnChange placeholder='Email Address'
                returnKeyType="none" {...bindTextInput(props.loginEntity, "email", null)}
            />

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
                        <View
                            style={[textInputWiz, { flexDirection: "row" }]}
                        >
                            <CheckBox checked={agreeToTerms} onChange={setAgreeToTerms} style={{marginRight: 10}}/>
                            <Text>Agree To </Text>
                            <Link onPress={() => {
                                linkTo('/create/terms')
                            }} >Terms Of Use</Link>
                        </View>
                        <View
                            style={[textInputWiz, { flexDirection: "row" }]}
                        >
                            <CheckBox checked={agreeToPrivacy} onChange={setAgreeToPrivacy} style={{marginRight: 10}} />
                            <Text>Agree To </Text>
                            <Link onPress={() => {
                                linkTo('/create/privacy')
                            }}>Privacy Policy</Link>
                        </View>
                    </>
            }
            {/* </Section> */}
        </View>
    </View>
}
