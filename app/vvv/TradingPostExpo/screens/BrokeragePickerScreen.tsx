import React, {useEffect, useState, useMemo, useRef} from "react"
import {View, Text, Animated, Pressable, Image} from "react-native"
import {Api} from "@tradingpost/common/api";
import {dismissBrowser, openBrowserAsync} from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {elevated, flex, fonts, paddView, paddViewWhite, row, sizes} from "../style"
import {ElevatedSection, Section, Subsection} from "../components/Section"
import {Bank, IBKR, RobinhoodLogo} from '../images';
import {Header, Subheader} from "../components/Headers";
import {useNavigation} from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";


export function BrokeragePickerScreen() {
    const nav = useNavigation();
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof Api.User.extensions.getBrokerageAccounts>>>()
    const intervalRef = useRef<any>();
    const toast = useToast();

    const openLink = async () => {
        const {link} = await Api.User.extensions.generateBrokerageLink(undefined);
        intervalRef.current = setInterval(async () => {
            if (await AsyncStorage.getItem("auth-finicity-code")) {
                setAccounts(await Api.User.extensions.getBrokerageAccounts())
                dismissBrowser()
                clearInterval(intervalRef.current);
                await AsyncStorage.removeItem("auth-finicity-code");
                toast.show("You've successfully linked your brokerage account to TradingPost through Finicity!")
            }
        }, 2000);

        const browserName = "finicity_auth";
        await openBrowserAsync(link, {"windowName": browserName});
        clearInterval(intervalRef.current);
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

    useEffect(() => {
        Api.User.extensions.getBrokerageAccounts().then((r) => {
            setAccounts(r);
        })
    }, [])


    return (<View style={flex}>
        <View style={[flex, {margin: sizes.rem1, justifyContent: 'center'}]}>
            <View style={{marginBottom: 10}}>
                <Header text="Choose your Brokerage"/>
            </View>
            <View style={{flex: 0.3, flexDirection: 'row'}}>
                <Pressable style={{flex: 1}} onPress={() => {
                    nav.navigate("IbkrInfo")
                }}>
                    <ElevatedSection style={{justifyContent: 'center', flex: 1, marginRight: sizes.rem1 / 2}} title="">
                        <Subheader text='Interactive Brokers'
                                   style={{textAlign: 'center', marginBottom: 10, color: 'black'}}/>
                        <View style={{
                            borderRadius: 20,
                            overflow: 'hidden',
                            aspectRatio: 1,
                            height: '75%',
                            justifyContent: 'center',
                            alignSelf: 'center'
                        }}>
                            <IBKR style={{}} height={"100%"} width={'100%'}/>
                        </View>
                    </ElevatedSection>
                </Pressable>
                <Pressable style={{flex: 1}} onPress={() => {
                    nav.navigate("RobinhoodLogin")
                }}>
                    <ElevatedSection style={{justifyContent: 'center', flex: 1, marginLeft: sizes.rem1 / 2}} title="">
                        <Subheader text='Robinhood' style={{textAlign: 'center', marginBottom: 10, color: 'black'}}/>
                        <View style={{
                            borderRadius: 20,
                            overflow: 'hidden',
                            aspectRatio: 1,
                            height: '75%',
                            justifyContent: 'center',
                            alignSelf: 'center'
                        }}>
                            <RobinhoodLogo style={{}} height={"100%"} width={'100%'}/>
                        </View>
                    </ElevatedSection>
                </Pressable>
            </View>
            <View style={{flex: 0.5}}>
                <Pressable style={{flex: 1}} onPress={() => {
                    openLink();
                }}>
                    <ElevatedSection style={{justifyContent: 'center', flex: 0.5}} title="">
                        <Subheader text='All other brokerages'
                                   style={{textAlign: 'center', marginBottom: 0, color: 'black'}}/>
                        <Text style={{textAlign: 'center', marginBottom: 10}}>
                            {"(Finicity, a Mastercard Company)"}
                        </Text>
                        <Bank height={"70%"}/>
                    </ElevatedSection>
                </Pressable>
            </View>
        </View>
    </View>)

}