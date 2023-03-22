
import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar, Icon } from "@ui-kitten/components";
import { View, Text, ViewStyle, Pressable } from "react-native";
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { AppColors } from "../constants/Colors";
import { OverlappingIconList } from "./OverlappingIconList";
import TrackPlayer, { State, useTrackPlayerEvents, Event, Track } from 'react-native-track-player';
import { AudioPlayerButtons } from "./AudioPlayerButtons";
import { useNavigation } from "@react-navigation/native";

export const SquaredAudioPlayer = (props: { iconUriList: string[],  track: Track, width?: number, maxIcons?: number,  iconSize?: string}) => {
    const {iconUriList, maxIcons,  iconSize, track, width} = props
    const nav = useNavigation()
    
    return (
        <View style={[{flex: 1}]}>        
            
                <View style={[shaded, {flexGrow: 1, width: width, flexDirection: 'column',backgroundColor: 'rgba(61,88,184, 0.50)', alignItems: 'center', justifyContent: 'center', paddingVertical: sizes.rem1, paddingHorizontal: sizes.rem1, marginBottom:sizes.rem0_25, marginRight: sizes.rem0_5}]}>
                    <Pressable onPress={async () => {
                            if (!track?.relatedId) return;
                            nav.navigate("WatchlistViewer", {
                                watchlistId: Number(track.relatedId) 
                            })
                            
                        }}
                        style={{flexGrow: 1,flexDirection: 'column',  justifyContent: 'center', alignItems: 'center'}}
                        >
                        <OverlappingIconList iconSize={iconSize} iconUriList={iconUriList} maxIcons={maxIcons} textColor={'white'}/>
                    
                        <Text style={{ color: AppColors.primary, textAlign: 'center'}}>
                                {track.title}
                        </Text>
                    </Pressable>
                    <Pressable onPress={async () => {
                            const queue = await TrackPlayer.getQueue()
                            const queueIndex = queue.findIndex(a => a.url === track.url)
                            if (queueIndex !== -1) {
                                await TrackPlayer.skip(queueIndex)
                                await TrackPlayer.play()
                            } 
                            else {
                                await TrackPlayer.add(track, 0)
                                await TrackPlayer.skip(0)
                                await TrackPlayer.play()
                            }
                        }}
                        style={{flexGrow: 1,flexDirection: 'column',  justifyContent: 'center', alignItems: 'center'}}
                        >
                        <Icon 
                            fill={ "green" }
                            height={36}
                            width={42}
                            name="arrow-right" 
                            style={{
                                height: 36,
                                width: 42
                            }}/>
                        <Text style={{color: 'grey', textAlign: 'center', fontSize: fonts.xSmall}}>
                            {`${track.createdAt < 1 ? Math.round(track.createdAt * 60) : track.createdAt} ${track.createdAt < 1 ? 'minutes': 'hours'} ago`}
                        </Text>
                    </Pressable>
                </View>
        </View>
    )
}
