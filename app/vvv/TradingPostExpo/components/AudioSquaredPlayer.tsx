
import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar, Icon } from "@ui-kitten/components";
import { View, Text, ViewStyle, Pressable } from "react-native";
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { AppColors } from "../constants/Colors";
import { OverlappingIconList } from "./OverlappingIconList";
import TrackPlayer, { State, useTrackPlayerEvents, Event, Track } from 'react-native-track-player';
import { AudioPlayerButtons } from "./AudioPlayerButtons";

export const SquaredAudioPlayer = (props: { iconUriList: string[], description: string, track: Track, width?: number, maxIcons?: number,  iconSize?: string}) => {
    const {iconUriList, description, maxIcons,  iconSize, track, width} = props
    
    return (
        <View style={[{flex: 1}]}>        
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
                <View style={[shaded, {flexGrow: 1, width: width, flexDirection: 'column',backgroundColor: companyProfileStyle.upBackgroundColor, alignItems: 'center', justifyContent: 'center', paddingVertical: sizes.rem1, paddingHorizontal: sizes.rem1, marginBottom:sizes.rem0_25, marginRight: sizes.rem0_5}]}>
                    <OverlappingIconList iconSize={iconSize} iconUriList={iconUriList} maxIcons={maxIcons} textColor={AppColors.primaryShaded}/>
                    <View style={{ alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{ color: AppColors.primary, textAlign: 'center'}}>
                                {track.title}
                        </Text>
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
                            {`${track.lastUpdated}`}
                        </Text>
                    </View>    
                </View>
            </Pressable>
        </View>
    )
}
