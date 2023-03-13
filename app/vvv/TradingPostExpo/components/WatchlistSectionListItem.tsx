import React, { useCallback, useEffect, useState } from "react"
import { Api } from "@tradingpost/common/api";
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { IWatchlistList } from "@tradingpost/common/api/entities/interfaces"
import { Pressable, Text, View } from "react-native"
import { fonts, row, sizes } from "../style"
import { ElevatedSection, Section } from "./Section"
import { OverlappingIconList } from "./OverlappingIconList";
import { Avatar, Icon } from "@ui-kitten/components";

export const WatchlistSectionListItem = (props: {id: number, shared: boolean, name: string, logoUriList: string[], type: string, userHandle?: string, userImageUri?: string}) => {
    const {id, shared, name, logoUriList, type, userHandle, userImageUri} = props
    const nav = useNavigation<any>();
    return (
        <ElevatedSection key={id} title="" style={{flex: 1, marginBottom: sizes.rem1_5 / 2, paddingVertical: sizes.rem0_5}}>
                        <Pressable
                            onPress={() => {
                                nav.navigate("WatchlistViewer", {
                                    watchlistId: id
                                })
                        }}>
                            {shared ? 
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                                    
                                    <Text style={{width: '33%', textAlign: 'center'}}>{name}</Text>
                                    <OverlappingIconList viewStyle={{width: '33%', justifyContent: 'center'}} maxIcons={5} iconUriList={logoUriList} />
                                    <View style={{width: '33%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                        <Avatar
                                            style={ {borderWidth: 1, borderColor: '#ccc'}}
                                            resizeMode={'cover'}
                                            size={'tiny'}
                                            shape="round"
                                            source={{uri: userImageUri}}
                                            />
                                        <Text style={{marginLeft: sizes.rem0_5,textAlign: 'center'}}>{userHandle}</Text>
                                    </View>
                                </View> : 
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                                    <Text style={{width: '33.33%', textAlign: 'center'}}>{name}</Text>
                                    <OverlappingIconList viewStyle={{width: '33.33%', justifyContent: 'center'}} maxIcons={5} iconUriList={logoUriList} />
                                    <View style={{width: `${33.33}%`, alignItems: 'center'}}>
                                        {type === 'public' ?  
                                            <Icon 
                                                fill={"green"}
                                                height={24}
                                                width={24}
                                                name="unlock-outline" style={{
                                                    height: 24,
                                                    width: 24
                                                }}/> :
                                            <Icon 
                                                fill={"red"}
                                                height={24}
                                                width={24}
                                                name="lock-outline" style={{
                                                    height: 24,
                                                    width: 24
                                                }}/>
                                            }
                                    </View>
                                </View>}
                        </Pressable>
                    </ElevatedSection>
    )
}