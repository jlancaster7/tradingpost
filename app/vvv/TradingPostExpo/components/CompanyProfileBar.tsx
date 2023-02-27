import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar } from "@ui-kitten/components";
import { View, Text } from "react-native";
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { Api } from "@tradingpost/common/api"

export const CompanyProfileBar = (props: { secId: number, symbol?: string, companyName?: string, imageUri?: string, contentSize?: 'medium' | 'large', makeShadedSec?: boolean }) => {
    const { imageUri, symbol, companyName, secId, makeShadedSec} = props;
    const chosenSize = props.contentSize || 'medium';
    const [intradayChange, setIntraDayChange] = useState<number>(),
          [currentPrice, setCurrentPrice] = useState<number>()
    
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
                    //console.log(pricing.historical[end].close)
                    setIntraDayChange(pricing.historical[end].close - pricing.historical[0].close);
                    //console.log(pricing.historical[end].close - pricing.historical[0].close)
                }
            }
        })()
    } ,[])

    return (
        <View style={[makeShadedSec ? [intradayChange ? (intradayChange > 0 ? {backgroundColor: companyProfileStyle.upBackgroundColor} : {backgroundColor: companyProfileStyle.downBackgroundColor}) : {backgroundColor: 'white'}, {...shaded, flex: 1, marginBottom: sizes.rem1 / 2,marginHorizontal: 4, paddingHorizontal: sizes.rem0_5, paddingVertical: sizes.rem0_5}] : {}]}>
            <SecPressable securityId={symbol && secId ? (symbol === 'USD:CUR' ? -1 : secId) : -1}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>               
                    <Avatar
                        style={{}}
                        resizeMode={'cover'}
                        size={companyProfileContentSizes[chosenSize].avatarSize}
                        shape="rounded"
                        source={{uri: imageUri}}
                        />
                    <View style={{flex: 1, marginLeft: 6}}>
                        <View style={{flex: 1, flexDirection: 'row',alignItems: 'flex-end', height: 20}}>
                            <Text style={{ fontWeight: companyProfileStyle.ticker.fontWeight, fontSize: companyProfileContentSizes[chosenSize].symbolSize, color:  companyProfileStyle.ticker.color}}>
                                {symbol ? (symbol === 'USD:CUR' ? '' : symbol) : ''}
                            </Text>
                            <Text style={{flex: 1, marginLeft: 3, overflow: 'hidden', fontSize: companyProfileContentSizes[chosenSize].symbolSize, fontWeight: companyProfileStyle.name.fontWeight, color: companyProfileStyle.name.color}} numberOfLines={1}>
                                {symbol ? (symbol === 'USD:CUR' ? 'Cash' : companyName || '') : ''}
                            </Text>
                        </View>
                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                            {intradayChange && intradayChange !== 0 ? (intradayChange > 0 ? <UpTriangle /> : <DownTriangle />) : undefined}
                            {intradayChange && currentPrice ?
                            <Text style={[{ fontWeight: companyProfileStyle.pctChg.fontWeight,fontSize: companyProfileContentSizes[chosenSize].pxSize, marginRight: 4}, (currentPrice && intradayChange && intradayChange !== 0) ? (intradayChange > 0 ?  {color: companyProfileStyle.upColor} : {color: companyProfileStyle.downColor}) : {color: 'black'}, symbol === 'USD:CUR' ? {display: 'none'} : {}]}>
                                {`${toPercent2(intradayChange / currentPrice)}`}
                            </Text> : undefined}
                            {currentPrice ? <Text style={[{ fontSize: companyProfileContentSizes[chosenSize].pxSize}, (currentPrice && intradayChange && intradayChange !== 0) ? (intradayChange > 0 ?  {color: companyProfileStyle.upColor} : {color: companyProfileStyle.downColor}) : {color: 'black'}, symbol === 'USD:CUR' ? {display: 'none'} : {}]}>
                                {`${toDollarsAndCents(currentPrice)}`}
                            </Text> : undefined}
                        </View>
                    </View>
                </View>
            </SecPressable>
        </View>
    )
}