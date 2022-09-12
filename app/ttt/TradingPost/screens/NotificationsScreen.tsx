import React, {useEffect, useState} from "react";
import {useWindowDimensions} from "react-native";
import {ScrollView, View} from "react-native";
import {Layout, Tab, TabBar, Text} from '@ui-kitten/components';
import {DataOrQuery, List} from "../components/List";
import {fonts} from "../style";

// Sorted by full-date time from api

const dummyData = [
    {
        _id: "1",
        date: "06/24/21",
        handle: "@bahamaben",
        action: "Bought",
        symbol: "CRWD",
        amount: "$240.52",
        type: "trade"
    },
    {
        _id: "2",
        date: "06/24/21",
        handle: "@bahamaben",
        action: "Closed",
        symbol: "AHT",
        amount: "$4.82",
        type: "trade"
    },
    {
        _id: "3",
        date: "06/24/21",
        handle: "@bahamaben",
        action: "Bought",
        symbol: "TDOC",
        amount: "$163.08",
        type: "trade"
    },

]

export const NotificationsScreen = (props: any) => {
    return (
        <View style={{flex: 1, backgroundColor: "#F7f8f8"}}>
            <ScrollView>
                <Layout style={{
                    backgroundColor: "#ffffff",
                    paddingBottom: '2px',
                    paddingTop: '2px',
                    borderBottomColor: '#11146F',
                    borderStyle: 'solid',
                    borderBottomWidth: 2
                }}>
                    <Text style={{
                        margin: 2,
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: '600',
                        color: '#11146F',
                    }}>Notifications</Text>
                </Layout>
                <List
                    getItemLayout={(items, index, sizeCache) => {
                        const curItem = items?.[index];
                        return typeof curItem === 'object' ? sizeCache[index] : {
                            index,
                            offset: sizeCache[index - 1].offset + sizeCache[index - 1].length,
                            length: 40
                        };
                    }}
                    data={dummyData}
                    keyExtractor={(item: any, index) => typeof item === 'string' ? "loadingtext" : (index + "_" + item._id)}
                    preloadOffset={2}
                    datasetKey={"____________"}
                    renderItem={(item) => {
                        if (typeof item.item === "string") return (
                            <Text
                                style={{textAlign: "center", fontSize: fonts.large}}>
                                Loading More...
                            </Text>);

                        return <NotificationView/>
                    }}
                    noDataMessage={"No Notifications Available"}
                    loadingItem={"Loading...?"}
                />
            </ScrollView>
        </View>
    )
}

const NotificationView = () => {
    const x = ["1","4","4","4"]
    const y: typeof x[number] = "5";

    return (
        <View>

        </View>
    );
}