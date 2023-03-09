
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
        <View style={{position: 'absolute', bottom: 0, backgroundColor: 'white', borderTopColor: 'grey', borderTopWidth: 0.2, borderBottomColor: 'grey', borderBottomWidth: 0.2, width: '100%'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: sizes.rem0_5}}>
                <View style={{marginRight: sizes.rem0_5}}>
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
                <Pressable style={{flexDirection: 'row', width: "50%", marginHorizontal: 0, }}
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
            <View style={{backgroundColor: 'black', height: 3, width: `${progress.duration ? (progress.position / progress.duration) * 100 : 0}%`}}>

            </View>
        </View>
    )
}