
import { parse } from 'url'
import React, { Children, FC, PropsWithChildren, ReactElement, useEffect, useLayoutEffect, useMemo, useRef } from "react";
//import { Text, View } from "react-native-ui-lib";
//import { LoginButtons } from "../components/LoginButtons";
import { AppTitle, SplashWelcome } from "../images";
//import { Screen } from "./BaseScreen";
//import CreateAccountScreen from "./CreateAccountScreen";
import { bannerText, fonts, paddView, sizes } from '../style'
import { G, GProps, Path, SvgProps } from "react-native-svg";
import { Link } from "../components/Link";
import { Animated, Platform, View, StyleSheet, Alert, Pressable } from "react-native";
import { SvgExpo } from "../components/SvgExpo";
import { LoginButtons } from "../components/LoginButtons";
import { NavigationProp, useLinkTo } from "@react-navigation/native";
import { Text, Layout, ViewPager, TabView, Tab } from "@ui-kitten/components";
import { useState } from "react";
import { ITextField, TextField } from "../components/TextField";
import { Header } from "../components/Headers";
import { Section } from "../components/Section";
//import { BaseScreenProps } from "../layouts/BaseLayout";
//import LoginScreen from "./LoginScreen";
//import { LoginButtons } from "../components/LoginButtons";
//import Auth from '@tradingpost/common/api/entities/static/AuthApi'
//import UserApi from '@tradingpost/common/api/entities/apis/UserApi'


import { useToast } from "react-native-toast-notifications";
//import { PublicPages } from "../navigation";
//import { EntityApiBase } from "@tradingpost/common/api/entities/static/EntityApiBase";
import { useAppUser } from "../Authentication";
import { useData } from "../lds";
import { PrimaryButton } from "../components/PrimaryButton";
import { Api } from "@tradingpost/common/api";
import { RootStackParamList, RootStackScreenProps } from "../navigation/pages";
import { useURL } from "expo-linking";
//import { resetEnsureUser } from "../components/EnsureUser";


const styles = StyleSheet.create({
    tab: {
        height: 192,
        alignItems: 'center',
        justifyContent: 'center',
    },

});
export type WelcomeScreenProps = { title: string }

const ensureG = (child: ReactElement): child is ReactElement<GProps> => {
    return child.type === G;
}

//Test function will move out into helper later 
const SvgMagic: React.FC<{ children: ReactElement<SvgProps> }> = (props) => {
    const reportChildren = (children: ReactElement) => {
        Children.forEach(children, (child) => {
            if (ensureG(child))
                console.log("FOUND G WITH ID:::::::" + child.props.id);
            else {
                console.log("FOUND SOMETHING:::::::" + (child.type as any).name);
                console.log("FOUND SOMETHINGS CHIULDREN:::::::" + (JSON.stringify(child.props)));
            }
            reportChildren(child.props.children);
        })
    };

    reportChildren(props.children);

    return props.children;
}

// class WelcomeScreen extends Screen<WelcomeScreenProps> {
//     layoutProps: BaseScreenProps = {
//         scrollContentFlex: true
//     }
//     Content = (p: WelcomeScreenProps & { componentId: string }) => {
//         return <><View style={[...paddView, { height: "100%", backgroundColor: "white" }]}>
//             <AppTitle style={{ marginVertical: sizes.rem2, alignSelf: "center" }} />
//             <SplashWelcome style={{ backgroundColor: "orange", width: "100%", aspectRatio: 1.5 }} />
//             <Text style={{ textAlign: "center", margin: sizes.rem2, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>Welcome to the team!</Text>
//             <LoginButtons
//                 createAccountProps={{
//                     onPress: () => {
//                     //    CreateAccountScreen.open(p.componentId, {});
//                     }
//                 }}
//                 loginProps={{
//                 //    onPress: () => LoginScreen.open(p.componentId, {})
//                 }}
//             />

//         </View>
//             <Link style={{ textAlign: "right", position: "absolute", bottom: sizes.rem1, right: sizes.rem1, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>What is TradingPost{">>"}</Link>
//         </>
//     };
// }
//console.log("MY app type is " + typeof AppTitle)

export default ({ navigation, route }: RootStackScreenProps<"Root">) => {

    //const url = useURL();
    // console.log(url);
    const linkTo = useLinkTo();
    // const ltRef = useRef(linkTo);
    // ltRef.current = linkTo;
    // const [urlToGoTo, setUrlToGoTo] = useState("");

    // useEffect(() => {
    //     if (url) {
    //         const urlParsed = parse(url, true);
    //         if (urlParsed.hostname?.toString() === "m.tradingpostapp.com" && !urlToGoTo) {
    //             console.log("Sending you to");
    //             setUrlToGoTo(url);
    //         }
    //     }
    // }, [url])

    const cleanUp = useRef<number>(),
        [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        //resetEnsureUser();
        return () => clearInterval(cleanUp.current);
    }, [])

    const
        userRef = useRef<ITextField>(null),
        passRef = useRef<ITextField>(null),
        [username, setUsername] = useState<string>(''),
        [password, setPassword] = useState<string>(''),
        [loggingIn, setLoggingIn] = useState(false),
        //{ isKeyboardVisible } = useIsKeyboardVisible(),
        //{ toastMessage, toastProps } = useToast(),
        //[resetMode, setResetMode] = useState(false),
        intervalRef = useRef<any>(),
        opacityAnim = useRef(new Animated.Value(0)).current,
        toast = useToast(),
        { appUser, signIn, authToken, loginResult, isSignInComplete } = useAppUser(),
        //{ value: hasAuthed, setValue } = useData("hasAuthed"),
        { value: firstTime, setValue: setFirstTime } = useData('firstTime');

    // const linkTo = useLinkTo<any>();

    useLayoutEffect(() => {

        if (firstTime) {
        } else {
            if (appUser || loginResult) {
                if (appUser) {
                    if (!appUser.settings || !Object.keys(appUser.settings).length) {
                        linkTo("/create/analyststart");
                    }
                    else if (appUser.settings.analyst && !appUser.analyst_profile) {
                        linkTo("/create/analystinterest")
                    }
                    else {
                        if (!loginResult?.verified)
                            linkTo("/verifyaccount")
                        //navigation.navigate("VerifyAccount", {});
                        else
                            linkTo("/dash/feed")
                        //navigation.navigate("Dash");


                    }
                }
                else if (isSignInComplete) {
                    linkTo("/create/basicinfo");
                }
            }
        }
    }, [appUser, loginResult])



    return <><View style={[...paddView, { justifyContent: "center", backgroundColor: "white" }]}>
        <AppTitle style={{ marginVertical: sizes.rem1, alignSelf: "center", width: "100%", aspectRatio: 5 }} />

        <TabView
            selectedIndex={selectedIndex}
            onSelect={index => {
                //TODO: investigate whats happenign here. This is not normal....            
                //console.log("VALUE IS BEING SET TO " + (index === NaN ? 1 : index))
                setSelectedIndex(isNaN(index) ? 0 : index)
            }}
            style={{
                width: "100%",
                //maxHeight: Platform.OS !== "web" ? "50%" : undefined,

            }}
            indicatorStyle={{
                height: 0
            }}
            tabBarStyle={{
                height: 0,
            }}
        >
            <Tab>
                <WTF_View
                    onReady={(item) => {
                        if (Platform.OS === "web" && item instanceof HTMLDivElement) {
                            const stonks = ["fb", "tsla", "nvda", "btc", "ether", "doge"].map((n) => item.querySelector<SVGGElement>(`[id=${n}]`));
                            stonks.forEach((s) => {
                                if (s)
                                    s.style.opacity = "0";
                            });

                            let lastItem: SVGGElement | null = null;
                            let lastItem2: SVGGElement | null = null;

                            if (intervalRef.current)
                                clearInterval(intervalRef.current);

                            intervalRef.current = setInterval(() => {
                                const index = Math.floor(Math.random() * (9));
                                const index2 = Math.floor(Math.random() * (9));

                                if (lastItem)
                                    lastItem.style.opacity = "0";

                                if (lastItem2)
                                    lastItem2.style.opacity = "0";


                                lastItem = stonks[index];
                                lastItem2 = stonks[index2];
                                if (lastItem)
                                    lastItem.style.opacity = "1";
                                if (lastItem2)
                                    lastItem2.style.opacity = "1";
                            }, 1000)
                        }
                    }}
                />
            </Tab>
            <Tab>
                <Section title="Login">
                    <TextField placeholder='Username' returnKeyType="next"
                        onChangeText={(name) => setUsername(name)}
                        //validateOnChange
                        textInputRef={userRef}
                        style={{ marginVertical: sizes.rem1 }}
                    //validate={isValidEmail}
                    //errorMessage={"Invalid Email Address"}
                    //validateOnChange
                    //onSubmitEditing={() => passRef.current?.focus()}
                    //error={userError}
                    />

                    <TextField
                        //containerStyle={{ height: 64 }}
                        //label='Password'
                        //validate={isRequired}
                        onChangeText={(pass) => setPassword(pass)}
                        placeholder='Password'
                        style={{ marginVertical: sizes.rem1 }}
                        //errorMessage="Invalid Password"
                        //validateOnChange
                        secureTextEntry textInputRef={passRef} />
                    <Link style={{ paddingTop: 4, paddingBottom: 16, alignSelf: "flex-end" }} onPress={() => {
                        //setResetMode(true);
                        setSelectedIndex(2)

                    }}>Forgot Password?</Link>
                </Section>
            </Tab>
            <Tab>
                <View>
                    <Text>Please enter your email address to recover your password:</Text>
                    <TextField style={{ marginVertical: sizes.rem1 }} value={username} placeholder="Email Address" onChangeText={(t) => {
                        setUsername(t);
                    }} />
                    <PrimaryButton onPress={async () => {
                        if (username && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(username)) {
                            Api.Auth.forgotPassword(username);
                            toast.show("Recovery Email has been sent");
                        }
                        else {
                            toast.show("Please enter a valid email address");
                        }
                    }} >Recover Password</PrimaryButton>
                </View>
            </Tab>
        </TabView>

        <Animated.Text style={[bannerText, {
            opacity: !selectedIndex ? 1 : opacityAnim
        }]}> {!selectedIndex ? "Welcome to the team!" : "Hey!!!!!... Welcome Back!"}</Animated.Text>
        <LoginButtons
            createAccountProps={{
                onPress: () => {
                    linkTo("/create/logininfo");
                    //navigation.navigate("Create");
                    //CreateAccountScreen.open(p.componentId, {});
                }
            }}
            loginProps={{
                onPress: async () => {
                    if (selectedIndex !== 1) {
                        setSelectedIndex(1);
                        Animated.timing(
                            opacityAnim,
                            {
                                delay: 0.75,
                                toValue: 1,
                                duration: 2000,
                                useNativeDriver: true
                            }).start();
                    }
                    else {
                        try {
                            await signIn(username, password);
                        }
                        catch (ex: any) {
                            toast.show(ex.message);
                        }
                    }
                }
                //setGlobalUser(true)
            }}
        />

    </View>
        {!selectedIndex && <Pressable
            onPress={() => {
                navigation.navigate('AppInformation')
            }}>
            <Text style={{ textAlign: "right", position: "absolute", bottom: sizes.rem1, right: sizes.rem1, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>
                What is TradingPost{">>"}
            </Text>
        </Pressable>}
    </>


}


const WTF_View = (props: {
    onReady: (item: any) => void

}) => {
    return <View style={{ width: "100%", aspectRatio: 1.5 }}>
        <SplashWelcome
            onReady={props.onReady}
        />
    </View>
}