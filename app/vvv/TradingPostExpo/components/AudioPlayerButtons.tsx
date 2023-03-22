
import React, { PropsWithChildren, useEffect, useRef, useState, Component, useCallback } from "react";
import { View, Text, ViewStyle, Pressable, ActivityIndicator } from "react-native";
import { Icon } from "@ui-kitten/components";
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import TrackPlayer, { State, useTrackPlayerEvents, Event, useProgress, usePlaybackState } from 'react-native-track-player';

export const AudioPlayerButtons = (props: {trackNumber?: number, horizontal?: boolean, showProgress?: boolean}) => {
    const { trackNumber, horizontal, showProgress } = props,
          [currentTrack, setCurrentTrack] = useState<number>(),
          state = usePlaybackState(),
          onTogglePlayback = useOnTogglePlayback(),
          isPlaying = state === State.Playing,
          progress = useProgress();

    const isLoading = useDebouncedValue(
        state === State.Connecting || state === State.Buffering,
        250
      );

    useEffect(() => {
        (async () => {
            setCurrentTrack(await TrackPlayer.getState())
        })()

    }, [])
    useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
        setCurrentTrack(event.nextTrack)
    })

    if (isLoading) {
        return (
          <View style={{flex: 1}}>
            {isLoading && <ActivityIndicator />}
          </View>
        );
      }

    return (
        <View style={horizontal ? {flex: 1, flexDirection: 'row'} : {flexDirection: 'column'}}>
            <View style={{ flexDirection: 'row', justifyContent:'space-between', marginVertical: sizes.rem0_25, alignItems: 'center' }}>
                <Pressable onPress={async () => {
                    await TrackPlayer.seekTo(progress.position - 10)
                    console.log('pressing rewind')
                }}> 
                    <Icon 
                        fill={"grey"}
                        height={32}
                        width={42}
                        name="rewind-left-outline" 
                        style={{
                            height: 32,
                            width: 42
                        }}/>
                </Pressable>
                {(!trackNumber && isPlaying) || (currentTrack === trackNumber && isPlaying) ? 
                    <Pressable onPress={async () => {
                        onTogglePlayback()
                        console.log('pressing pause')
                    }}>
                        <Icon 
                            fill={"red"}
                            height={36}
                            width={42}
                            name="pause-circle" 
                            style={{
                                height: 36,
                                width: 42
                            }}/>
                    </Pressable> :
                    <Pressable onPress={async () => {
                        if (trackNumber && currentTrack !== trackNumber) await TrackPlayer.skip(trackNumber);
                        onTogglePlayback()
                    }}>
                        <Icon 
                            fill={ "green" }
                            height={36}
                            width={42}
                            name="arrow-right" 
                            style={{
                                height: 36,
                                width: 42
                            }}/>
                    </Pressable> 
                    }
                <Pressable onPress={async () => {
                  await TrackPlayer.seekTo(progress.position + 10)
                    console.log('pressing fastforward')
                }}>
                    <Icon 
                        fill={"grey"}
                        height={32}
                        width={42}
                        name="rewind-right-outline" 
                        style={{
                            height: 32,
                            width: 42
                        }}/>
                </Pressable>
            </View>
            <View style={[showProgress ? {} : {display: 'none'}, { alignItems: 'center'}]}>
              <Text>
                {`${progress.position} / ${progress.duration}`}
              </Text>
            </View>
          </View>
    )
}

export const useOnTogglePlayback = () => {
    const state = usePlaybackState();
    const isPlaying = state === State.Playing;
  
    return useCallback(() => {
      if (isPlaying) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
    }, [isPlaying]);
  };
export const useDebouncedValue = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState<any>(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  };
  