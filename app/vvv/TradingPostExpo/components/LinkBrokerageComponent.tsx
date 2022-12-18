import {flex, sizes} from "../style";

import React, {useEffect, useRef, useState} from "react";
import {Animated, Pressable, Text, Alert, Platform} from "react-native";
import {Icon} from "@ui-kitten/components";

import {Api} from "@tradingpost/common/api";
import {Section} from "./Section";
import {Table} from "./Table";
import {AddButton, EditButton} from "./AddButton";
import {openBrowserAsync} from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {DirectBrokeragesType} from "@tradingpost/common/brokerage/interfaces";

//@ts-ignore
const alertPolyfill = (title, description, options, extra) => {
    const result = window.confirm([title, description].filter(Boolean).join('\n'))

    if (result) {
        //@ts-ignore
        const confirmOption = options.find(({style}) => style !== 'cancel')
        confirmOption && confirmOption.onPress()
    } else {
        //@ts-ignore
        const cancelOption = options.find(({style}) => style === 'cancel')
        cancelOption && cancelOption.onPress()
    }
}

const alert = Platform.OS === 'web' ? alertPolyfill : Alert.alert;
export const LinkBrokerageComponent = () => {
    const nav = useNavigation();
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof Api.User.extensions.getBrokerageAccounts> | null>>()
    const intervalRef = useRef<any>();
    const [needsRefresh, setNeedsRefresh] = useState<{}>();
    const [brokerLink, setLink] = useState("");

    const openLink = async () => {
        await Api.User.extensions.generateBrokerageLink(undefined).then(({link}) => {
            setLink(link)
        })
        const browserName = "finicity_auth";
        await openBrowserAsync(brokerLink, {"windowName": browserName});
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(async () => {
            console.log("WTF");
            if (await AsyncStorage.getItem("auth-finicity-code")) {
                console.log("CODE HAS BEEN FOUND");
                setAccounts(await Api.User.extensions.getBrokerageAccounts())
            }
        }, 5000)
    }

    const removeAccount = async (accountId: number, brokerage: DirectBrokeragesType) => {
        await Api.Brokerage.extensions.scheduleForDeletion({brokerage, accountId});
        if (!accounts) return
        setAccounts(accounts.filter(a => a.id !== accountId));
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

    useEffect(() => {
    }, [needsRefresh])

    useFocusEffect(
        React.useCallback(() => {
            setAccounts(null);
            Api.User.extensions.getBrokerageAccounts().then((r) => {
                setAccounts(r);
            });
        }, [])
    );

    return (
        <Section style={flex} title="Link Brokerage Account" button={(buttonProps) => accounts?.length ? <EditButton
            onPress={() => {
                nav.navigate("BrokeragePicker")
            }}
            height={buttonProps.height}
            width={buttonProps.width}
        /> : <AddButton
            onPress={() => nav.navigate("BrokeragePicker")}
            height={buttonProps.height}
            width={buttonProps.width}
        />}>
            <Table datasetKey={accounts?.map(a => a.id).join(",") || "none"}
                   columns={[
                       {alias: "Brokerage", field: "broker_name"},
                       {alias: "Account #", field: "account_number"},
                       {alias: " ", field: "remove", width: '10%', align: 'left'}
                   ]}
                   data={accounts?.map(acc => {
                       return {
                           ...acc,
                           remove: <Pressable
                               onPress={() => {
                                   return alert(
                                       `Removing ${acc.broker_name} Account?`,
                                       `Are you sure you want to remove this brokerage account?`,
                                       [
                                           {
                                               text: "Yes",
                                               onPress: async () => {
                                                   await removeAccount(acc.id, acc.broker_name as DirectBrokeragesType)
                                               }
                                           },
                                           {
                                               text: "No"
                                           }
                                       ]
                                   )

                               }}>
                               <Icon
                                   fill={"#E74C3C"}
                                   name={"trash-outline"}
                                   style={{
                                       height: sizes.rem1,
                                       width: sizes.rem1,
                                   }}
                               />
                           </Pressable>
                       }
                   })}
                   noDataMessage="You have no linked accounts"
            />
        </Section>)
}