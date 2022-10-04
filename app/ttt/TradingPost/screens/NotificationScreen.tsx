import React, {useEffect, useState} from "react";
import {Pressable} from "react-native";
import {ScrollView, View} from "react-native";
import {Layout, Text} from '@ui-kitten/components';
import {List} from "../components/List";
import {flex, fonts, paddView, sizes} from "../style";
import {Api} from '@tradingpost/common/api';
import {ListAlertsResponse} from "@tradingpost/common/api/entities/interfaces";
import {ElevatedSection} from "../components/Section";
import {NavigationProp, useNavigation} from "@react-navigation/native";
import * as Notifications from 'expo-notifications'

export const NotificationScreen = () => {
    const [code, setCode] = useState('');
    useEffect(() => {
        const d = async () => {
            const token = (await Notifications.getDevicePushTokenAsync()).data;
            console.log(token)
            setCode(token);
        }
        d().then().catch()
    }, [])
    return <View style={{flex: 1, backgroundColor: "#F7f8f8"}}>
        <View>
            <Layout style={{
                backgroundColor: "#ffffff",
                paddingBottom: '2%',
                paddingTop: '2%',
                borderBottomColor: '#11146F',
                borderStyle: 'solid',
                borderBottomWidth: 2,
                marginBottom: 10
            }}>
                <Text style={{
                    margin: 2,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: '600',
                    color: '#11146F',
                }}>Notifications</Text>
            </Layout>
            <Text>CODE: {code}</Text>
            <List
                key={"STATIC"}
                datasetKey={"__________"}
                getItemLayout={(items, index, sizeCache) => {
                    const curItem = items?.[index];
                    return typeof curItem === 'object' ? sizeCache[index] : {
                        index,
                        offset: sizeCache[index - 1].offset + sizeCache[index - 1].length,
                        length: 10
                    };
                }}
                data={async (allItems: any, page: number, sizeCache: any[]): Promise<ListAlertsResponse[]> => {
                    const notifications = (await Api.Notification.extensions.listAlerts({
                        page,
                    }));

                    const newNotifications = [...(allItems || []), ...notifications];
                    newNotifications.forEach((item, index) => {
                        if (!sizeCache[index]) {
                            sizeCache[index] = {
                                index,
                                offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                                length: 0,
                            }
                        }
                    });
                    return newNotifications;
                }}
                keyExtractor={(item: any, index) => typeof item === 'string' ? "loadingtext" : (index + "_" + item._id)}
                preloadOffset={1}
                renderItem={(item) => {
                    if (typeof item.item === "string") {
                        return <Text style={{textAlign: "center", fontSize: fonts.large}}>Loading More...</Text>
                    }
                    switch (item.item.type) {
                        case "NEW_USER_INTERACTION":
                            return <UserInteractionNotification response={item.item}/>;
                        case "NEW_TRADES":
                            return <NewTradeNotification response={item.item}/>
                        default:
                            console.error(`Follow Type: ${item.item.type} not registered`);
                            return <DefaultNotification response={item.item}/>
                    }
                }}
                noDataMessage={"No Notifications Available"}
                loadingItem={" "}
            />
        </View>
    </View>
}

const NotificationTab: React.FC<any> = (props: any) => {
    return <ElevatedSection title={""} style={{marginHorizontal: sizes.rem2 / 2, marginVertical: sizes.rem1 / 2,}}>
        <View style={{marginBottom: -sizes.rem0_5}}>
            <View style={{flexDirection: "row", width: "100%", marginBottom: sizes.rem0_5}}>
                <View style={[flex, {marginLeft: sizes.rem0_5}]}>
                    {props.children}
                </View>
            </View>
        </View>
    </ElevatedSection>
}

const NewTradeNotification = (props: { response: ListAlertsResponse }): JSX.Element => {
    const dt = new Date(props.response.dateTime);
    const dtFmt = `${dt.getMonth()}/${dt.getDay()}/${dt.getFullYear() % 100}`

    const nav = useNavigation<NavigationProp<any>>();
    const openTrades = () => {
        nav.navigate("NotificationTrade")
    }

    return <NotificationTab>
        <Pressable onPress={openTrades}>
            <View style={{flex: 1, flexWrap: 'wrap'}}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{marginRight: 10, fontFamily: "K2D"}}>
                        {dtFmt}
                    </Text>
                    <Text style={{flex: 1, flexWrap: 'wrap'}}>
                        {props.response.data.message} <Text style={{fontWeight: 'bold'}}>Click to learn more.</Text>
                    </Text>
                </View>
            </View>
        </Pressable>
    </NotificationTab>
}

const UserInteractionNotification = (props: { response: ListAlertsResponse }): JSX.Element => {
    const nav = useNavigation<NavigationProp<any>>();
    const openProfile = () => {
        if (props.response.data?.userId) {
            nav.navigate("Profile", {
                userId: props.response.data?.userId
            });
        }
    }

    const dt = new Date(props.response.dateTime);
    const dtFmt = `${dt.getMonth()}/${dt.getDay()}/${dt.getFullYear() % 100}`
    return <NotificationTab>
        <Pressable
            onPress={openProfile}>
            <View style={{flex: 1}}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{marginRight: 10}}>
                        {dtFmt}
                    </Text>
                    <Text>
                        <Text
                            style={{fontWeight: "bold"}}>@{props.response.data.handle}</Text>{' '}{props.response.data.message}
                    </Text>
                </View>
            </View>
        </Pressable>
    </NotificationTab>
}

const DefaultNotification = (props: { response: ListAlertsResponse }): JSX.Element => {
    return <NotificationTab>
        <Text>
            {props.response.data.message}
        </Text>
    </NotificationTab>
}