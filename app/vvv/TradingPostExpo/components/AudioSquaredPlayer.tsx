
import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar, Icon } from "@ui-kitten/components";
import { View, Text, ViewStyle, Pressable } from "react-native";
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { Api } from "@tradingpost/common/api"
import { AppColors } from "../constants/Colors";
import { OverlappingIconList } from "./OverlappingIconList";
import TrackPlayer, { State, useTrackPlayerEvents, Event, Track } from 'react-native-track-player';
import { AudioPlayerButtons } from "./AudioPlayerButtons";

export const SquaredAudioPlayer = (props: { iconUriList: string[], description: string, track: Track, maxIcons?: number, viewStyle?: ViewStyle, iconSize?: string}) => {
    const {iconUriList, description, maxIcons, viewStyle, iconSize, track} = props
    

    return (
        <View style={[shaded, {flex: 1, backgroundColor: 'rgba(116,125,156, 0.5)', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginHorizontal: 8}]}>
            <OverlappingIconList iconSize={iconSize} iconUriList={iconUriList} maxIcons={maxIcons} viewStyle={viewStyle} textColor={'white'}/>
            <Text style={{ color: 'white', textAlign: 'center', marginVertical: sizes.rem0_25}}>
                {description}
            </Text>
            <Pressable onPress={async () => {
                        const queue = await TrackPlayer.getQueue()
                        const queueIndex = queue.findIndex(a => a.url === track.url)
                        console.log(queue)
                        console.log(queueIndex)
                        if (queueIndex !== -1) {
                            await TrackPlayer.skip(queueIndex)
                            await TrackPlayer.play()
                        } 
                        else {
                            await TrackPlayer.add(track, 0)
                            await TrackPlayer.skip(0)
                            await TrackPlayer.play()
                        }
                    }}>
                        <Icon 
                            fill={ "white" }
                            height={36}
                            width={42}
                            name="arrow-right" 
                            style={{
                                height: 36,
                                width: 42
                            }}/>
                    </Pressable> 
        </View>
    )
}
