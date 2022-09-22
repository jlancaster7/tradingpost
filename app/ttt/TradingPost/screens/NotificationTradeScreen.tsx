import {View, Text, ScrollView, Pressable} from "react-native";
import {Api} from "@tradingpost/common/api";
import {ListTradesResponse} from "@tradingpost/common/api/entities/interfaces/index";
import {ElevatedSection} from "../components/Section";
import {NavigationProp, useNavigation} from "@react-navigation/native";
import {Avatar, Icon, Layout} from "@ui-kitten/components"
import {List} from "../components/List";
import {flex, fonts, sizes} from "../style";
import {AppColors} from "../constants/Colors";
import React from "react";

export const NotificationTradeScreen = (props: any) => {
    return (
        <View style={{flex: 1, backgroundColor: "#F7f8f8"}}>
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
                    }}>Trade Alerts</Text>
                </Layout>
                <List
                    style={{
                        marginTop: '0.25rem'
                    }}
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
                    data={async (allItems: any, page: number, sizeCache: any[]): Promise<ListTradesResponse[]> => {
                        const trades = (await Api.Notification.extensions.listTrades({
                            page
                        }));

                        const newTrades = [...(allItems || []), ...trades];
                        newTrades.forEach((item, index) => {
                            if (!sizeCache[index]) {
                                sizeCache[index] = {
                                    index,
                                    offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                                    length: 0,
                                }
                            }
                        });
                        return newTrades;
                    }}
                    keyExtractor={(item: any, index: number) => typeof item === 'string' ? 'loadingtext' : (index + "_" + item._id)}
                    preloadOffset={1}
                    renderItem={(item) => {
                        if (typeof item.item === 'string') {
                            return <Text style={{textAlign: "center", fontSize: fonts.large}}>Loading More...</Text>
                        }

                        const dt = new Date(item.item.dateTime);
                        const dtFmt = `${dt.getMonth()+1}/${dt.getDay()}/${dt.getFullYear() % 100}`

                        switch (item.item.type) {

                            case "sell":
                                return <ElevatedSection title={""} style={{paddingTop: '0.5rem', paddingBottom: '0.5rem', marginHorizontal: sizes.rem2/2, marginVertical: sizes.rem1/2,}}>
                                    <View style={{marginBottom: -sizes.rem0_5}}>
                                        <View style={{flexDirection: "row", width: "100%", marginBottom: sizes.rem0_5}}>
                                            <View style={[flex, {marginLeft: sizes.rem0_5}]}>
                                                <Pressable onPress={() => {
                                                }}>
                                                    <View style={{flex: 1}}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: "space-between"
                                                        }}>
                                                            <Text style={{width: '15%'}}>
                                                                {dtFmt}
                                                            </Text>
                                                            <Text style={{width: '30%'}}>
                                                                @{item.item.handle}
                                                            </Text>
                                                            <Text style={{color: "#22DDAA", fontWeight: "bold", width: '20%'}}>
                                                                Bought
                                                            </Text>
                                                            <Text style={{width: '12%'}}>
                                                                {item.item.symbol}
                                                            </Text>
                                                            <Text style={{width: '20%'}}>
                                                                ${toTwoDecimals(item.item.price)}
                                                            </Text>
                                                            <View style={{width: '8%'}}>
                                                                <Icon style={{ opacity: 1, height: 16, width: 32 }} name={"file-text-outline"}
                                                                      fill={AppColors.primary}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </ElevatedSection>
                            case "buy":
                                return <ElevatedSection title={""} style={{paddingTop: '0.5rem', paddingBottom: '0.5rem', marginHorizontal: sizes.rem2/2, marginVertical: sizes.rem1/2,}}>
                                    <View style={{marginBottom: -sizes.rem0_5}}>
                                        <View style={{flexDirection: "row", width: "100%", marginBottom: sizes.rem0_5}}>
                                            <View style={[flex, {marginLeft: sizes.rem0_5}]}>
                                                <Pressable onPress={() => {
                                                }}>
                                                    <View style={{flex: 1}}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: "space-between"
                                                        }}>
                                                            <Text style={{width: '15%'}}>
                                                                {dtFmt}
                                                            </Text>
                                                            <Text style={{width: '30%'}}>
                                                                @{item.item.handle}
                                                            </Text>
                                                            <Text style={{color: "#F4452D", fontWeight: "bold", width: '20%'}}>
                                                                Closed
                                                            </Text>
                                                            <Text style={{width: '12%'}}>
                                                                {item.item.symbol}
                                                            </Text>
                                                            <Text style={{width: '20%'}}>
                                                                ${toTwoDecimals(item.item.price)}
                                                            </Text>
                                                            <View style={{width: '8%'}}>
                                                                <Icon style={{ opacity: 1, height: 16, width: 32 }} name={"file-text-outline"}
                                                                      fill={AppColors.primary}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </ElevatedSection>
                            default:
                                return <ElevatedSection title={""} style={{marginHorizontal: sizes.rem2/2, marginVertical: sizes.rem1/2, paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>
                                    <View style={{marginBottom: -sizes.rem0_5}}>
                                        <View style={{flexDirection: "row", width: "100%", marginBottom: sizes.rem0_5}}>
                                            <View style={[flex, {marginLeft: sizes.rem0_5}]}>
                                                <Pressable onPress={() => {
                                                }}>
                                                    <View style={{flex: 1}}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: "space-between"
                                                        }}>
                                                            <Text style={{width: '15%'}}>
                                                                {dtFmt}
                                                            </Text>
                                                            <Text style={{width: '30%'}}>
                                                                @{item.item.handle}
                                                            </Text>
                                                            <Text style={{fontWeight: "bold", width: '20%'}}>
                                                                {toUpperCase(item.item.type)}
                                                            </Text>
                                                            <Text style={{width: '12%'}}>
                                                                {item.item.symbol}
                                                            </Text>
                                                            <Text style={{width: '20%'}}>
                                                                ${toTwoDecimals(item.item.price)}
                                                            </Text>
                                                            <View style={{width: '8%'}}>
                                                                <Icon style={{ opacity: 1, height: 16, width: 32 }} name={"file-text-outline"}
                                                                      fill={AppColors.primary}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </ElevatedSection>
                        }
                    }}
                    noDataMessage={"No Trades Available"}
                    loadingItem={" "}
                />
            </View>
        </View>
    )
}

const toUpperCase = (ss: string) => {
    const s = ss.trim().toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const toTwoDecimals = (ss: string): string => {
    const f = parseFloat(ss);
    return f.toFixed(2);
}