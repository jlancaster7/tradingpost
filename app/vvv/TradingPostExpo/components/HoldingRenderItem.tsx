import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Avatar, Icon } from "@ui-kitten/components"
import { View, Text, Pressable, ScrollView, useWindowDimensions, Animated, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import { ElevatedSection, Section, Subsection } from "./Section"
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { fonts, sizes } from "../style"
import { AppColors } from "../constants/Colors"
import { toDollars, toDollarsAndCents, toNumber1, toPercent1 } from "../utils/misc"

export const HoldingRenderItem = (props: {item: any, byId: any, isOwner: boolean}) => {
    const { item, byId } = props
    const secId = item.item.security_id;
    //const intradayChange = item.item.price ? item.item.price.price - item.item.price.open : 0
    //const hideEmptyNote = watchlist?.user[0].id !== appUser?.id
    return (
        <ElevatedSection title="" style={{flex: 1, marginBottom: sizes.rem1_5 / 2, marginHorizontal: sizes.rem1_5 / 4, paddingHorizontal: sizes.rem0_5, paddingVertical: sizes.rem0_5}}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <SecPressable securityId={byId[secId] ? (byId[secId].symbol === 'USD:CUR' ? -1 : secId) : -1}>                                        
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
                            {byId[secId] ? (byId[secId].symbol === 'USD:CUR' ? 'Cash' : byId[secId].symbol) : ''}
                </Text>
                <Text style={[item.item.optionInfo ? {display: 'flex'} : {display: 'none'}, {fontSize: fonts.xSmall}]}>
                        {item.item.optionInfo && `${String(item.item.optionInfo[0].type).toLowerCase() === 'call' ? 'C' : 'P'}${toNumber1(item.item.optionInfo[0].strike_price)} ${new Date(item.item.optionInfo[0].expiration).toLocaleDateString()}`}
                    </Text>
                <Text style={[{flex: 1, color: '#606060'}, byId[secId] ? (byId[secId].symbol === 'USD:CUR' ? {display: 'none'} : {display: 'flex'}) : {display: 'none'}]}>
                    {toDollarsAndCents(item.item.price)}
                </Text>
            </View>

        </View>
        <View style={{flex: 1, alignContent: 'space-between', marginTop: sizes.rem0_5, flexDirection: 'row'}}>
            <View style={{flex: 1, alignItems: 'center', flexDirection: 'row'}}>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={{fontSize: fonts.medium / 2, color: '#9D9D9D'}}>
                        {props.isOwner ? 'Market Value' : '% Portfolio'}
                    </Text>
                    <Text style={{fontSize: fonts.small, color: '#606060'}}>
                        {props.isOwner ? `${toDollars(item.item.value)}` : `${toPercent1(item.item.value)}`}
                    </Text>
                </View>
                <View style={[{flex: 1, alignItems: 'center'}, byId[secId] ? (byId[secId].symbol === 'USD:CUR' ? {display: 'none'} : {display: 'flex'}) : {display: 'none'}]}>
                    <Text style={{fontSize: fonts.medium / 2, color: '#9D9D9D'}}>
                        {'Cost'}
                    </Text>
                    <Text style={{fontSize: fonts.small, color: '#606060'}}>
                        {`${toDollarsAndCents(item.item.cost_basis)}`}
                    </Text>                                                    
                </View>
            </View>
        </View>
        <View style={[{flex: 1, flexDirection: 'row'}, props.isOwner ? {display: 'flex'} : {display: 'none'}]}>
            <View style={[{flex: 1, alignItems: 'center'}, byId[secId] ? (byId[secId].symbol === 'USD:CUR' ? {display: 'none'} : {display: 'flex'}) : {display: 'none'}]}>
                <Text style={{fontSize: fonts.medium / 2, color: '#9D9D9D'}}>
                    {'Profit/Loss'}
                </Text>
                <Text style={[{fontSize: fonts.small}, 
                               item.item.pnl >= 0 ? (item.item.pnl === 0 ? {color: 'black'} : {color: 'green'}) : {color: 'red'}]}>
                    {`${toDollars(item.item.pnl)}`}
                </Text>
            </View>

        </View>
    </ElevatedSection>
    )
}