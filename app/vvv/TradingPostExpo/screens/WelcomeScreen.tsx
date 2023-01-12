import React, { Children, ReactElement, useEffect, useRef } from "react";
import { AppTitle, SplashWelcome } from "../images";
import { bannerText, fonts, paddView, sizes } from '../style'
import { G, GProps, Path, SvgProps } from "react-native-svg";
import { Link } from "../components/Link";
import { Animated, Platform, View, StyleSheet, Alert, Pressable } from "react-native";
import { LoginButtons } from "../components/LoginButtons";
import { useLinkTo } from "@react-navigation/native";
import { Text, TabView, Tab } from "@ui-kitten/components";
import { useState } from "react";
import { ITextField, TextField } from "../components/TextField";
import { Section } from "../components/Section";
import { useToast } from "react-native-toast-notifications";
import { useAppUser } from "../Authentication";
import { PrimaryButton } from "../components/PrimaryButton";
import { Api } from "@tradingpost/common/api";
import { RootStackScreenProps } from "../navigation/pages";
import { useInitialRoute } from '../navigation/RootNavigator';
import { getCallBackUrl } from "@tradingpost/common/api/entities/static/EntityApiBase";


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


export default ({ navigation }: RootStackScreenProps<"Root">) => {
    const linkTo = useLinkTo();
    const cleanUp = useRef<number>(),
        [selectedIndex, setSelectedIndex] = useState(0);
    const route = useInitialRoute();

    useEffect(() => {
        return () => clearInterval(cleanUp.current);
    }, [])

    const
        userRef = useRef<ITextField>(null),
        passRef = useRef<ITextField>(null),
        [username, setUsername] = useState<string>(''),
        [password, setPassword] = useState<string>(''),
        intervalRef = useRef<any>(),
        opacityAnim = useRef(new Animated.Value(0)).current,
        toast = useToast(),
        [isLoggingIn, setIsLoggingIn] = useState(false),
        { signIn } = useAppUser();


    useEffect(() => {
        if (route !== "Root")
            navigation.replace(route);
    }, [route])

    return <><View style={[...paddView, { justifyContent: "center", backgroundColor: "white" }]}>
        <AppTitle style={{ marginVertical: sizes.rem1, alignSelf: "center", width: "100%", aspectRatio: 5 }} />

        <TabView
            selectedIndex={selectedIndex}
            onSelect={index => setSelectedIndex(isNaN(index) ? 0 : index)}
            style={{ width: "100%" }}
            indicatorStyle={{ height: 0 }}
            tabBarStyle={{ height: 0 }}
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
                    <TextField placeholder='Email Address' returnKeyType="next"
                        onChangeText={(name) => setUsername(name)}
                        textInputRef={userRef}
                        style={{ marginVertical: sizes.rem1 }}
                    />
                    <TextField
                        onChangeText={(pass) => setPassword(pass)}
                        placeholder='Password'
                        style={{ marginVertical: sizes.rem1 }}
                        secureTextEntry textInputRef={passRef} />
                    <Link style={{ paddingTop: 4, paddingBottom: 16, alignSelf: "flex-end" }} onPress={() => {
                        setSelectedIndex(2)
                    }}>Forgot Password?</Link>
                </Section>
            </Tab>
            <Tab>
                <View>
                    <Text>Please enter your email address to recover your password:</Text>
                    <TextField style={{ marginVertical: sizes.rem1 }} value={username} placeholder="Email Address"
                        onChangeText={(t) => {
                            setUsername(t);
                        }} />
                    <PrimaryButton onPress={async () => {
                        if (username && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(username)) {
                            Api.Auth.forgotPassword(username, getCallBackUrl());
                            toast.show("Recovery Email has been sent");
                        } else {
                            toast.show("Please enter a valid email address");
                        }
                    }}>Recover Password</PrimaryButton>
                </View>
            </Tab>
        </TabView>

        <Animated.Text style={[bannerText, {
            opacity: !selectedIndex ? 1 : opacityAnim
        }]}> {!selectedIndex ? "Welcome to the team!" : "Hey... Welcome Back!"}</Animated.Text>
        <LoginButtons
            createAccountProps={{ onPress: () => { linkTo("/create/logininfo"); } }}
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
                    } else {
                        if (!isLoggingIn) {
                            try {
                                setIsLoggingIn(true);
                                await signIn(username, password);
                                toast.hideAll();
                                setIsLoggingIn(false);

                            } catch (ex: any) {
                                setIsLoggingIn(false);
                                toast.show(ex.message);
                            }
                        }
                        else {
                            toast.show("Still working on logging you in....", {
                                duration: 5000
                            })
                        }
                    }
                }
            }}
        />

    </View>
        {!selectedIndex && Platform.OS !== "web" && <Pressable
            style={{
                position: "absolute",
                bottom: sizes.rem1,
                right: sizes.rem1,
                padding: 15,
                paddingBottom: 10 
            }}
            onPress={() => {
                navigation.navigate('AppInformation')
            }}>
            <Text style={{
                textAlign: "right",
                
                fontSize: fonts.large,
                lineHeight: fonts.large * 1.5
            }}>
                {"What is TradingPost >>"}
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