
import { bannerText, flex, paddView, paddViewWhite, sizes, thinBannerText } from "../style";

import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";

import { Api } from "@tradingpost/common/api";
import { ElevatedSection, Section } from "./Section";
import { Table } from "./Table";
import { AddButton, EditButton } from "./AddButton";
import { openBrowserAsync } from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export const LinkBrokerageComponent = (props: any) => {
    const nav = useNavigation();
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof Api.User.extensions.getBrokerageAccounts>>>()
    const intervalRef = useRef<any>();
    const [needsRefresh, setNeedsRefresh] = useState<{}>();
    const openLink = async () => {
        await Api.User.extensions.generateBrokerageLink(undefined).then(({ link }) => {
            setLink(link)
        })
        const browserName = "finicity_auth";
        await openBrowserAsync(brokerLink, { "windowName": browserName });
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(async () => {
            console.log("WTF");
            if (await AsyncStorage.getItem("auth-finicity-code")) {
                console.log("CODE HAS BEEN FOUND");
                setAccounts(await Api.User.extensions.getBrokerageAccounts())
            }
        }, 5000)
    }
    //cleanup
    useEffect(() => {
        AsyncStorage.removeItem("auth-finicity-code");
        return () => {
            clearInterval(intervalRef.current);
            AsyncStorage.removeItem("auth-finicity-code");
        }
    }, [])


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
    const [brokerLink, setLink] = useState("");
    useEffect(() => {
    }, [needsRefresh])

    useEffect(() => {
        Api.User.extensions.getBrokerageAccounts().then((r) => {
            setAccounts(r);
        })
    }, [])

    
    return (
    <Section style={flex} title="Link Brokerage Accounts" button={(buttonProps) => accounts?.length ? <EditButton
        onPress={() => {
            props.props.navigation.navigate("BrokeragePicker")
        }}
        height={buttonProps.height}
        width={buttonProps.width}
        /> : <AddButton
        onPress={() => nav.navigate("BrokeragePicker")}
        height={buttonProps.height}
        width={buttonProps.width}
        />} >
        <Table datasetKey={accounts?.map(a => a.id).join(",") || "none"} 
               columns={[
                { alias: "Brokerage",field: "broker_name", align: "left" }, 
                { alias: "Account #",field: "account_number", align: "left" }
                ]} 
                data={accounts} 
                noDataMessage="You have no linked accounts" 
        />
    </Section>)
}