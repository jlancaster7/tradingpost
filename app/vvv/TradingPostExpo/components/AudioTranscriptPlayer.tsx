
import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar, Icon } from "@ui-kitten/components";
import { View, Text, ViewStyle, Pressable } from "react-native";
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { AppColors } from "../constants/Colors";
import { OverlappingIconList } from "./OverlappingIconList";
import TrackPlayer, { State, useTrackPlayerEvents, Event, Track } from 'react-native-track-player';
import { AudioPlayerButtons } from "./AudioPlayerButtons";
import { useNavigation } from "@react-navigation/native";

export const TranscriptAudioPlayer = (props: { iconUriList: string[],  track: Track, width?: number, maxIcons?: number,  iconSize?: string, hideTitle?: boolean}) => {
    const {iconUriList, maxIcons,  iconSize, track, width, hideTitle} = props
    const nav = useNavigation(),
          [expandText, setExpandText] = useState(false)
    
    return (
        <View style={[{flex: 1}]}>        
            
                <View style={[shaded, {flexGrow: 1, width: width, flexDirection: 'column',backgroundColor: 'rgba(53,64,162, 0.2)', alignItems: 'center', justifyContent: 'center', paddingVertical: sizes.rem1, paddingHorizontal: sizes.rem0_5, marginBottom:sizes.rem0_25}]}>
                    <View
                        style={{}}
                        >
                        {/*<OverlappingIconList iconSize={iconSize} iconUriList={iconUriList} maxIcons={maxIcons} textColor={AppColors.primaryShaded}/>*/}
                        <Pressable onPress={() => {
                            setExpandText(!expandText)
                        }}>

                        
                            <Text style={[{ color: 'black'}]} numberOfLines={expandText ? undefined : 2} ellipsizeMode='tail'>
                                    {track.transcript}
                            </Text>
                            {expandText ? undefined : <Text style={[{color: 'grey'}]}>
                                Read more
                            </Text>}
                        </Pressable>
                    </View>
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
                        style={{flexGrow: 1,flexDirection: 'row',  justifyContent: 'center', alignItems: 'center'}}
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
                        <Text style={{color: '#8F8F8F', textAlign: 'center', fontSize: fonts.xSmall}}>
                            {`${track.createdAt < 1 ? Math.round(track.createdAt * 60) : track.createdAt} ${track.createdAt < 1 ? 'minutes': 'hours'} ago`}
                        </Text>
                    </Pressable>
                </View>
            
        </View>
    )
}
