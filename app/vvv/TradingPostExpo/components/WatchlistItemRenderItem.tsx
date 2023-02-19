import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Avatar, Icon } from "@ui-kitten/components"
import { View, Text, Pressable, ScrollView, useWindowDimensions, Animated, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import { ElevatedSection, Section, Subsection } from "./Section"
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { fonts, sizes } from "../style"
import { AppColors } from "../constants/Colors"
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { Api } from "@tradingpost/common/api"
import { CompanyProfileBar } from "./CompanyProfileBar"

export const WatchlistItemRenderItem = (props: {item: any, bySymbol: any, byId: any, hideEmptyNote: boolean, setShownMap?: any, shownMap?: any, watchlist?: any}) => {
    const {item, bySymbol, byId, hideEmptyNote, setShownMap, shownMap, watchlist} = props;
    const symbol = item.item.symbol || '';
    const secId = bySymbol[symbol] ? bySymbol[symbol].id : 0;
    return (
        <ElevatedSection title="" style={[{flex: 1, marginBottom: sizes.rem1 / 2, paddingHorizontal: sizes.rem0_5, paddingVertical: sizes.rem0_5}, props.item.index % 2 === 0 ? {marginRight: sizes.rem1 / 4} : {marginLeft: sizes.rem1 / 4}]}>
            <CompanyProfileBar symbol={symbol}
                            companyName={byId[secId] ? byId[secId].company_name : ''} 
                            imageUri={byId[secId] ? byId[secId].logo_url  : undefined}
                            secId={secId}
                            />
            <View>
                {shownMap && watchlist && shownMap[item.index]  ?
                    <NoteEditor note={item.item.note} 
                                onChangeNote={(note) => {
                                    item.item.note = note;
                                }} 
                                canEdit={!hideEmptyNote} 
                                ticker={symbol} 
                                watchlistId={watchlist.id} /> 
                                : null
                                }
            </View>
        </ElevatedSection>
    )
}