import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar } from "@ui-kitten/components";
import { View, Text } from "react-native";
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { fonts, sizes } from "../style";
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { Api } from "@tradingpost/common/api"

export const CompanyProfileBar = (props: { secId: number, symbol?: string, companyName?: string, imageUri?: string, contentSize?: 'medium' | 'large' }) => {
    const { imageUri, symbol, companyName, secId} = props;
    const chosenSize = props.contentSize || 'medium';
    const [intradayChange, setIntraDayChange] = useState<number>(),
          [currentPrice, setCurrentPrice] = useState<number>()
    const contentSizes = {
        medium: {
            avatarSize: 'medium',
            symbolSize: fonts.xSmall,
            nameSize: fonts.xSmall + 2,
            pxSize: fonts.xSmall + 2
        },
        large: {
            avatarSize: 'giant',
            symbolSize: fonts.small,
            nameSize: fonts.small + 2,
            pxSize: fonts.small + 2
        }
    }
    useEffect(() => {
        (async () => {
            let pricingLength = 0
            let yesterday = new Date()
            let count = 0
            while (pricingLength < 2 && count <= 4) {
                count += 1
                yesterday = new Date((new Date((new Date()).setDate((yesterday).getDate() - 1))).setHours(0))
                const pricing = await Api.Security.extensions.getPrices({securityId: secId, includeIntraday: false, includeHistorical: true, sinceDateTime: yesterday.toISOString()})
                pricingLength = pricing.historical.length
                if (pricingLength === 2){
                    const end = pricing.historical.length - 1;
                    setCurrentPrice(pricing.historical[end].close);
                    setIntraDayChange(pricing.historical[end].close - pricing.historical[0].close);
                }
            }
        })()
    } ,[])

    return (
        <SecPressable securityId={symbol && secId ? (symbol === 'USD:CUR' ? -1 : secId) : -1}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>               
                <Avatar
                    style={{}}
                    resizeMode={'cover'}
                    size={contentSizes[chosenSize].avatarSize}
                    shape="rounded"
                    source={{uri: imageUri}}
                    />
                <View style={{flex: 1, marginLeft: 6}}>
                    <View style={{flex: 1, flexDirection: 'row',alignItems: 'flex-end', height: 20}}>
                        <Text style={{ fontWeight: '500', fontSize: contentSizes[chosenSize].symbolSize, color: '#9D9D9D'}}>
                            {symbol ? (symbol === 'USD:CUR' ? '' : symbol) : ''}
                        </Text>
                        <Text style={{flex: 1, marginLeft: 3, overflow: 'hidden', fontSize: contentSizes[chosenSize].symbolSize, fontWeight: '400'}} numberOfLines={1}>
                            {symbol ? (symbol === 'USD:CUR' ? 'Cash' : companyName || '') : ''}
                        </Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        {intradayChange && intradayChange !== 0 ? (intradayChange > 0 ? <UpTriangle /> : <DownTriangle />) : undefined}
                        {intradayChange && currentPrice ?
                        <Text style={[{ fontWeight: '500',color: '#606060', fontSize: contentSizes[chosenSize].pxSize, marginRight: 4}, intradayChange >= 0 ? (!intradayChange ? {color: 'black'} : {color: '#1AA457'}) : {color: '#D81222'}]}>
                            {`${toPercent2(intradayChange / currentPrice)}`}
                        </Text> : undefined}
                        {currentPrice ? <Text style={[{ color: '#606060', fontSize: contentSizes[chosenSize].pxSize}, (currentPrice && intradayChange && intradayChange !== 0) ? (intradayChange > 0 ?  {color: '#1AA457'} : {color: '#D81222'}) : {color: 'black'}, symbol === 'USD:CUR' ? {display: 'none'} : {}]}>
                            {`${toDollarsAndCents(currentPrice)}`}
                        </Text> : undefined}
                    </View>
                </View>
            </View>
        </SecPressable>
    )
}