import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Avatar, Icon } from "@ui-kitten/components"
import { View, Text, Pressable, ScrollView, useWindowDimensions, Animated, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import { ElevatedSection, Section, Subsection } from "./Section"
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { fonts, sizes } from "../style"
import { AppColors } from "../constants/Colors"
import { toDollars, toDollarsAndCents, toFormatedDateTime, toNumber1 } from "../utils/misc"

export const TradeRenderItem = (props: {item: any, byId: any, isOwner: boolean}) => {
    const { item, byId } = props
    const secId = item.item.security_id || item.item.securityId;
    //const intradayChange = item.item.price ? item.item.price.price - item.item.price.open : 0
    //const hideEmptyNote = watchlist?.user[0].id !== appUser?.id
    return (
        <ElevatedSection title="" style={{flex: 1, marginBottom: sizes.rem1_5 / 2, marginHorizontal: sizes.rem1_5 / 4, paddingHorizontal: sizes.rem0_5, paddingVertical: sizes.rem0_5}}>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <SecPressable securityId={secId}>                                        
                    <Avatar
                        style={{borderWidth: 1, borderColor: '#ccc'}}
                        resizeMode={'contain'}
                        size="large"
                        shape="rounded"
                        source={
                            (() => {
                                let output: { uri: string } | undefined;
                                output = byId[secId] ? { uri: byId[secId].logo_url  } : undefined
                                return output;
                            })()}
                        />
                </SecPressable>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={{flex: 1, fontWeight: '900', color: '#454545'}}>
                                {byId[secId] ? (byId[secId].symbol === 'USD:CUR' ? 'Cash' : `${item.item.type.slice(0,1).toUpperCase() + item.item.type.slice(1) } ${byId[secId].symbol}`) : ''}
                    </Text>
                    <Text style={[item.item.optionInfo ? {display: 'flex'} : {display: 'none'}, {fontSize: fonts.xSmall}]}>
                        {item.item.optionInfo && `${String(item.item.optionInfo[0].type).toLowerCase() === 'call' ? 'C' : 'P'}${toNumber1(item.item.optionInfo[0].strike_price)} ${new Date(item.item.optionInfo[0].expiration).toLocaleDateString()}`}
                    </Text>
                    <Text style={{flex: 1, color: '#606060'}}>
                        {`@ ${toDollarsAndCents(item.item.price)}`}
                    </Text>
                </View>
            </View>
            <View style={{flex: 1, alignContent: 'space-between', marginTop: sizes.rem0_5, flexDirection: 'row'}}>
                <View style={[{flex: 1, alignItems: 'center', flexDirection: 'row'}, props.isOwner ? {display: 'flex'} : {display: 'none'}]}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <Text style={{fontSize: fonts.medium / 2, color: '#9D9D9D'}}>
                            {'Quantity'}
                        </Text>
                        <Text style={{fontSize: fonts.small, color: '#606060'}}>
                            {`${item.item.quantity}`}
                        </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <Text style={{fontSize: fonts.medium / 2, color: '#9D9D9D'}}>
                            {'Market Value'}
                        </Text>
                        <Text style={{fontSize: fonts.small, color: '#606060'}}>
                            {`${toDollars(item.item.amount)}`}
                        </Text>                                                    
                    </View>
                </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{fontSize: fonts.medium / 2, color: '#9D9D9D'}}>
                    {'Trade Date'}
                </Text>
                <Text style={[{fontSize: fonts.xSmall}]}>
                    {`${(new Date(item.item.date)).getUTCHours() !== 12 ? toFormatedDateTime(String(item.item.date)) : (new Date(item.item.date)).toLocaleDateString()}`}
                </Text>
            </View>
        </View>
        </ElevatedSection>
    )
}