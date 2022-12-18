import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Avatar, Icon } from "@ui-kitten/components"
import { View, Text, Pressable, ScrollView, useWindowDimensions, Animated, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import { ElevatedSection, Section, Subsection } from "./Section"
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { fonts, sizes } from "../style"
import { AppColors } from "../constants/Colors"
import { toDollarsAndCents } from "../utils/misc"

export const WatchlistItemRenderItem = (props: {item: any, bySymbol: any, byId: any, hideEmptyNote: boolean, setShownMap: any, shownMap: any, watchlist: any}) => {
    const symbol = props.item.item.symbol;
    const secId = props.bySymbol[symbol] ? props.bySymbol[symbol].id : 0;
    const intradayChange = props.item.item.price ? props.item.item.price.price - props.item.item.price.open : 0
    //const hideEmptyNote = watchlist?.user[0].id !== appUser?.id
    return (
        <ElevatedSection title="" style={{flex: 1, marginBottom: sizes.rem1_5 / 2, marginHorizontal: sizes.rem1_5 / 4, paddingHorizontal: sizes.rem0_5, paddingVertical: sizes.rem0_5}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                
                <SecPressable securityId={secId}>                                        
                    <Avatar
                        style={{borderWidth: 1, borderColor: '#ccc'}}
                        resizeMode={'contain'}
                        size="medium"
                        shape="rounded"
                        source={
                            (() => {
                                let output: { uri: string } | undefined;
                                
                                output = props.bySymbol[symbol] ? { uri: props.bySymbol[symbol].logo_url  } : undefined
                                return output;
                            })()}
                        />
                </SecPressable>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{ fontWeight: '900', color: '#454545'}}>
                                    {props.byId[secId] ? (props.byId[secId].symbol === 'USD:CUR' ? 'Cash' : props.byId[secId].symbol) : ''}
                        </Text>
                        {/*<Pressable onPress={() => {
                            if (props.item.item.note || !props.hideEmptyNote) {
                                props.setShownMap({
                                    ...props.shownMap,
                                    [props.item.index]: !props.shownMap[props.item.index]
                                })
                            }
                            }}
                            style={{marginLeft: 10, justifyContent: 'flex-end'}}
                            >
                            <Icon style={{ opacity: (props.item.item.note || !props.hideEmptyNote) ? (props.item.item.note ? 1 : 0.5) : 0, height: 16 , width: 22 , }} 
                                name={!props.shownMap[props.item.index] ? "file-text-outline" : "close-outline"}
                                fill={AppColors.primary}
                                />
                        </Pressable>
                        */}
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[{ color: '#606060', fontSize: fonts.xSmall, marginRight: 4}, intradayChange >= 0 ? (!intradayChange ? {color: 'black'} : {color: 'green'}) : {color: 'red'}]}>
                            {`${toDollarsAndCents(intradayChange)}`}
                        </Text>
                        <Text style={{ color: '#606060', fontSize: fonts.xSmall}}>
                            {`${toDollarsAndCents(props.item.item.price?.price)}`}
                        </Text>


                    </View>

                </View>
                
            
            </View>
            <View>
                {props.shownMap[props.item.index] && props.watchlist ?
                    <NoteEditor note={props.item.item.note} 
                                onChangeNote={(note) => {
                                    props.item.item.note = note;
                                }} 
                                canEdit={!props.hideEmptyNote} 
                                ticker={props.item.item.symbol} 
                                watchlistId={props.watchlist.id} /> 
                                : null
                                }
            </View>
        </ElevatedSection>
    )
}