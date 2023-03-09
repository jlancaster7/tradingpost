
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, useWindowDimensions, Animated } from "react-native";
import { Header, Subheader } from "../components/Headers";
import { ElevatedSection, Section, ShadedSection } from "../components/Section";
import { CompanyProfileBar } from "../components/CompanyProfileBar";
import { FlatList } from "react-native-gesture-handler";
import {PrimaryChip} from '../components/PrimaryChip';
import { flex, fonts, sizes, row, companyProfileStyle, shaded } from "../style";
import {LimitedBlockList} from "./BlockListModalScreen";
import { AppColors } from "../constants/Colors";
import {Avatar, Icon, Text} from '@ui-kitten/components';
import { useSecuritiesList } from "../SecurityList";
import { List } from "../components/List";
import { ProfileBar } from "../components/ProfileBar";
import { IUserList, IWatchlistGet, IWatchlistList } from "@tradingpost/common/api/entities/interfaces";
import { ProfileButton } from "../components/ProfileButton";
import { OverlappingIconCollage } from "../components/OverlappingIconCollage";
import { OverlappingIconList } from "../components/OverlappingIconList";
import { SquaredAudioPlayer } from "../components/AudioSquaredPlayer";
import TrackPlayer, {Track} from 'react-native-track-player';
import { useNavigation } from "@react-navigation/core";
import { WatchlistSection } from "../components/WatchlistSection";
import { WatchlistLimitedPublicSection } from "../components/WatchlistLimitedPublicSection";
import { AudioPlayerBottomBar } from "../components/AudioPlayerBottomBar";

export const AudioScreen = (props: any) => {
    const [tracks, setTracks] = useState<Track[]>([]),
          { securities: { list: securities, byId, bySymbol } } = useSecuritiesList(),
          {width: windowWidth} = useWindowDimensions()

    useEffect(() => {
        (async () => {
            
            //await TrackPlayer.reset()
            const audioTracks = await Api.Audio.extensions.getMostRecentWatchlists({})
            setTracks(audioTracks.map(a => {
                return {
                    url: a.audio_url,
                    title: `${a.watchlist_name}`,
                    artist: a.handle,
                    description: a.watchlist_note,
                    artwork: a.profile_url,
                    trackType: a.related_type,
                    relatedId: a.related_id,
                    lastUpdated: (new Date()).toLocaleTimeString('en-US'),
                    iconUriList: a.symbols.filter(a => bySymbol[a]).map(a => bySymbol[a].logo_url)
                } as Track
            }))
            
        })()
    }, [])
    
    return (
        <View style={[ flex, { backgroundColor: AppColors.background }]}>
            <Section title="Your Bites" key='audio' style={{paddingVertical: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                <List 
                    datasetKey={`tracks_${tracks.length}`}
                    data={tracks}

                    loadingItem={""}
                    horizontal
                    renderItem={(item) => {
                        return typeof item.item === "string" ? 
                                    <Text>Loading</Text> : 
                                    <SquaredAudioPlayer key={`squred_player_${item.index}`} 
                                                        description={item.item.title || ''} 
                                                        track={item.item}  
                                                        iconUriList={item.item.iconUriList} 
                                                        width={windowWidth * 0.4}
                                                        maxIcons={6}
                                                        iconSize={'medium'} 
                                                />
                    }}
                    />
            </Section>
            <View style={{position: "absolute",
                    bottom: 0,
                    alignItems: "stretch",
                    width: "100%",
                    backgroundColor: "white",}}>
                <AudioPlayerBottomBar />
            </View>
        </View>
    )
}