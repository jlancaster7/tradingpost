import { Icon, Text } from "@ui-kitten/components";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { AppColors } from "../../constants/Colors";
import { bannerText, flex, paddView, paddViewWhite, sizes, thinBannerText } from "../../style";
import { CreateAccountProps } from "../CreateAccountScreen"
import Bank from '../../assets/bank.svg'
import { SvgExpo } from "../../components/SvgExpo";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";
import { View } from "../../components/Themed";
import { Api } from "@tradingpost/common/api";
import { ElevatedSection, Section } from "../../components/Section";
import { Table } from "../../components/Table";
import { AddButton, EditButton } from "../../components/AddButton";
import { openBrowserAsync } from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LinkBrokerageSection = (props: CreateAccountProps) => {

    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof Api.User.extensions.getBrokerageAccounts>>>()
    const intervalRef = useRef<any>();
    const [needsRefresh, setNeedsRefresh] = useState<{}>();
    const openLink = async () => {
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
        Api.User.extensions.generateBrokerageLink(undefined).then(({ link }) => {
            setLink(link)
        })
    }, [needsRefresh])

    useEffect(() => {
        Api.User.extensions.getBrokerageAccounts().then((r) => {
            setAccounts(r);
        })
    }, [])

    //const linkTo = useLinkTo<any>()
    return <ScrollWithButtons
        fillHeight
        buttons={{
            right: {
                text: "I'm Done Linking Accounts",
                onPress: () => {
                    props.next();
                }
            }
        }}
    >
        <Animated.View style={[paddView, { opacity: opacityAnim }]}>
            <ElevatedSection title={""} style={flex}>
                <Text style={[thinBannerText]}>Link Your Brokerage Accounts.</Text>
                <View style={{ padding: sizes.rem1 }}>
                    <SvgExpo>
                        <Bank />
                    </SvgExpo>
                </View>
                <Text style={{ marginVertical: sizes.rem1 }}>TradingPost links directly with your bank accounts to ....</Text>
                <Section style={flex} title="Link Accounts" button={(props) => accounts?.length ? <EditButton
                    onPress={() => {
                        openLink();
                    }}
                    height={props.height}
                    width={props.width}
                /> : <AddButton
                    onPress={() => openLink()}
                    height={props.height}
                    width={props.width}
                />} >
                    <Table datasetKey={accounts?.map(a => a.id).join(",") || "none"} columns={[{ field: "broker_name", align: "left" }, { field: "account_number", align: "left" }]} data={accounts} noDataMessage="You have no linked accounts" />
                </Section>
            </ElevatedSection>
        </Animated.View>
    </ScrollWithButtons >
}