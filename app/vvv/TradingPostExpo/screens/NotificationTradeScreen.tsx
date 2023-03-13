import {View, Text, Pressable} from "react-native";
import {Api} from "@tradingpost/common/api";
import {ListTradesResponse} from "@tradingpost/common/api/entities/interfaces";
import {ElevatedSection} from "../components/Section";
import {Layout} from "@ui-kitten/components"
import {List} from "../components/List";
import {flex, fonts, sizes} from "../style";
import React from "react";

const tradeType = (dt: string, handle: string, symbol: string, price: string, type: string = "Bought", color: string = "#22DDAA") => {
    return <ElevatedSection title={""} style={{
        paddingTop: sizes.rem0_5,
        paddingBottom: sizes.rem0_5,
        marginHorizontal: sizes.rem2 / 2,
        marginVertical: sizes.rem1 / 2,
    }}>
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
                                    {dt}
                                </Text>
                                <Text style={{width: '30%'}}>
                                    @{handle}
                                </Text>
                                <Text style={{
                                    color: color,
                                    fontWeight: "bold",
                                    width: '20%'
                                }}>
                                    {type}
                                </Text>
                                <Text style={{width: '15%'}}>
                                    {symbol}
                                </Text>
                                <Text style={{width: '20%'}}>
                                    ${toTwoDecimals(price)}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
    </ElevatedSection>
}

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
                        marginBottom: '15%'
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
                        const dtFmt = `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear() % 100}`

                        switch (item.item.type) {
                            case "sell":
                                return tradeType(dtFmt, item.item.handle, item.item.symbol, item.item.price, "Closed", "#F4452D")
                            case "buy":
                                return tradeType(dtFmt, item.item.handle, item.item.symbol, item.item.price)
                            default:
                                return tradeType(dtFmt, item.item.handle, item.item.symbol, item.item.price, toUpperCase(item.item.type), "")
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