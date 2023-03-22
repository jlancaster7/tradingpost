
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, useWindowDimensions, Animated } from "react-native";
import { flex, fonts, sizes, row, companyProfileStyle, shaded } from "../style";
import {Avatar, Icon, Text} from '@ui-kitten/components';
import TrackPlayer, {usePlaybackState, useProgress, useTrackPlayerEvents, Track, Event} from 'react-native-track-player';
import { AudioPlayerButtons } from "./AudioPlayerButtons";
import { useNavigation } from "@react-navigation/native";

export const AudioPlayerBottomBar = () => {
    const progress = useProgress(),
          [currentTrack, setCurrentTrack] = useState<Track>(),
          nav = useNavigation()
    useEffect(() => {
        (async () => {
            
            const currentTrackIndex = await TrackPlayer.getCurrentTrack()
            const queue = await TrackPlayer.getQueue()
            const track = await TrackPlayer.getTrack(currentTrackIndex)
            if (track) setCurrentTrack(track);
            else if (queue.length) setCurrentTrack(queue[0])
        })()
    }, [])
    useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
        const track = await TrackPlayer.getTrack(event.nextTrack)
        if (track) setCurrentTrack(track)
        else setCurrentTrack(undefined)
    })

    return (
        <View style={[{
            position: 'absolute', 
            bottom: 55, 
            backgroundColor: '#FFFFFF', 
            borderRadius: 12,
            width: '95.1%',
            alignSelf: 'center'
            }, 
            currentTrack ? {} : {display: 'none'}]}
            >
            <View style={{backgroundColor: 'rgba(61,88,184, 0.50)',borderRadius: 12}}>    
                <View style={{ flexDirection: 'row', alignItems: 'stretch', padding: sizes.rem0_5*1.25}}>
                    <View style={{ justifyContent: 'center'}}>
                        <Pressable onPress={async () => {
                                await TrackPlayer.reset()
                            }} 
                            style={[{ justifyContent: "center" }]}>
                            <Icon fill={"grey"}
                                height={30}
                                width={30}
                                name="close-outline" 
                                style={{ height: 30, width: 30 }}
                                />
                        </Pressable>
                    </View>
                    <Pressable style={{flexDirection: 'row', width: "55%", marginHorizontal: 0, }}
                            onPress={() => {
                                    if (!currentTrack?.relatedId) return
                                    nav.navigate("WatchlistViewer", {
                                        watchlistId: Number(currentTrack?.relatedId) 
                                    })
                            }}>
                        <View>
                            <Avatar source={{uri: currentTrack?.iconUriList[0] as string}} />
                        </View>
                        <View style={{ justifyContent: 'center', marginLeft: sizes.rem1, width: '80%'}}>
                            <Text>
                                {currentTrack?.title}
                            </Text>
                        </View>
                    </Pressable>
                    <View style={{width: "35%", alignItems: 'flex-end'}}>
                        <AudioPlayerButtons />
                    </View>
                    

                </View>
                <View style={{backgroundColor: 'black',marginHorizontal: 10, height: 3, width: `${progress.duration ? (progress.position / progress.duration) * 90 : 0}%`}}>
                </View>
            </View>
            
        </View>
    )
}