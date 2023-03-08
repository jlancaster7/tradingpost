
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
    const [watchlist, setWatchlist] = useState<IWatchlistGet>(),
          [tracks, setTracks] = useState<Track[]>([]),
          [watchlistSecIdList, setWatchlistSecIdList] = useState<{symbol: string, companyName: string, imageUri: string, secId: number}[]>([]),
          { securities: { list: securities, byId, bySymbol } } = useSecuritiesList()

    useEffect(() => {
        (async () => {
            
            //await TrackPlayer.reset()
            setTracks([{
                url: 'https://tradingpost-audio-files.s3.us-east-1.amazonaws.com/ArkInnovationFund-3-7-23_1230pmET.52b7f98d-0c13-4da7-ade2-15a5eb5156a0.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCE2y2nfHmImyo%2Fb8TYnGeHMCgc%2BJidiVpF%2Bw9c44OBWAIhALntWUfM06X%2B1tpMkTXWaBKGp0Vo8pNNa4s0htnhMP9kKugCCEkQABoMNjcwMTcxNDA3Mzc1Igz6zF5WTZhU9fT2Rs0qxQK2ttsKvAwqFNZ6Qyw6OGyB6IZl5U56pVRTq7IzQd%2BGyhsMG3Y74seiWtc3zGiGAvWt7CxHwHANlcMa9aXojzVzxZPMSf0zgCmTCtHhR%2B5iT%2F0NoYa1Wb0GqW2QJ5UU0nqKr3EQqzCO0aYWCBDH22gW1UCHPzhb0uAw31JUKVf2mKXU4%2FJs%2BYQgtv1AawbFAHoDT5uwidKhfdTpcO8t%2B5%2Fma3%2FqPnOYx2rZ24dxV7zw%2F2pPd01xQ1XFmmsRXVOlj9aoGzazVOMafh%2B7kZ3SBPs7Hlln%2BgIsdqTrUFoC8E0arHy4DRd7zEqtc%2BxjqI%2BD6O3ohRDWMmUxaBQTpB9872u9aHP%2BKimWE2dtUqzPThJCz91dKk8et2ARxcVA%2BqyqeysXqsJ95bVQwL2cB5Hy3Nk29NpBK8vH7z0ohUMB%2FqGF4CCtqV5iMKrloqAGOrICQj2kmGua4oilZVsEXPlccU%2B%2FXHONJesqZIDX1GG9mainXp56%2FrUDrR7NjVxKtMez67ps6YYQjtRaMRVh0x9ASsIxJQu%2BIHx0D%2FnHUoR%2F7cOrLGHoIw8abKFwEv1NOToQPXvkPmO%2BPIQFXn2o%2BQ%2F9og0V9bH9LvmKEXJO1zlt9MI8PyV0vep1fHWdEOEsQjeOvpPGYp3wfjegtYjInNGevmmmcIA93r4ganyAeU%2FS%2F6UYGfNjnAQcft89WBFm8sZ09MXS%2BUirAE122X4M%2Fq74JM830okUjecdRshDuVIM4rW7kZ3Ni0BI9uTvFE8Eki45Z5M9ymKG%2BvuL%2Blh6qB2UsWGY4YMZrPuy95whmgCaiAgQOh4ulcOmDGfDRtHJVBchy6jh4Q6ZwRpGb%2BNPWYtokTy4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230308T160730Z&X-Amz-SignedHeaders=host&X-Amz-Expires=39600&X-Amz-Credential=ASIAZYCKUEQHSJ5PTNW7%2F20230308%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=cac499c598553cf28b3bfdcecbabb8af7db55fe84e131052bdbbe62c8e3f8fe7', 
                title: 'Test', 
                artist: 'TradingPost News'
            }, 
            {
                url: 'https://tradingpost-audio-files.s3.us-east-1.amazonaws.com/CRWD-summary.beaf4764-2059-46f4-8b20-dd1d1f43df93.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCE2y2nfHmImyo%2Fb8TYnGeHMCgc%2BJidiVpF%2Bw9c44OBWAIhALntWUfM06X%2B1tpMkTXWaBKGp0Vo8pNNa4s0htnhMP9kKugCCEkQABoMNjcwMTcxNDA3Mzc1Igz6zF5WTZhU9fT2Rs0qxQK2ttsKvAwqFNZ6Qyw6OGyB6IZl5U56pVRTq7IzQd%2BGyhsMG3Y74seiWtc3zGiGAvWt7CxHwHANlcMa9aXojzVzxZPMSf0zgCmTCtHhR%2B5iT%2F0NoYa1Wb0GqW2QJ5UU0nqKr3EQqzCO0aYWCBDH22gW1UCHPzhb0uAw31JUKVf2mKXU4%2FJs%2BYQgtv1AawbFAHoDT5uwidKhfdTpcO8t%2B5%2Fma3%2FqPnOYx2rZ24dxV7zw%2F2pPd01xQ1XFmmsRXVOlj9aoGzazVOMafh%2B7kZ3SBPs7Hlln%2BgIsdqTrUFoC8E0arHy4DRd7zEqtc%2BxjqI%2BD6O3ohRDWMmUxaBQTpB9872u9aHP%2BKimWE2dtUqzPThJCz91dKk8et2ARxcVA%2BqyqeysXqsJ95bVQwL2cB5Hy3Nk29NpBK8vH7z0ohUMB%2FqGF4CCtqV5iMKrloqAGOrICQj2kmGua4oilZVsEXPlccU%2B%2FXHONJesqZIDX1GG9mainXp56%2FrUDrR7NjVxKtMez67ps6YYQjtRaMRVh0x9ASsIxJQu%2BIHx0D%2FnHUoR%2F7cOrLGHoIw8abKFwEv1NOToQPXvkPmO%2BPIQFXn2o%2BQ%2F9og0V9bH9LvmKEXJO1zlt9MI8PyV0vep1fHWdEOEsQjeOvpPGYp3wfjegtYjInNGevmmmcIA93r4ganyAeU%2FS%2F6UYGfNjnAQcft89WBFm8sZ09MXS%2BUirAE122X4M%2Fq74JM830okUjecdRshDuVIM4rW7kZ3Ni0BI9uTvFE8Eki45Z5M9ymKG%2BvuL%2Blh6qB2UsWGY4YMZrPuy95whmgCaiAgQOh4ulcOmDGfDRtHJVBchy6jh4Q6ZwRpGb%2BNPWYtokTy4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230308T192703Z&X-Amz-SignedHeaders=host&X-Amz-Expires=39600&X-Amz-Credential=ASIAZYCKUEQHSJ5PTNW7%2F20230308%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6d6dfc3c1019c3527975bbda5d38393b1e46c095d9b2e968e2d0a88087c2a0c6', 
                title: 'Test 2', 
                artist: 'TradingPost News'
            }])
            
            const featuredWatchlist = await Api.Watchlist.get(120)
            setWatchlist(featuredWatchlist)
            const featuredWatchlistItems = featuredWatchlist.items.filter(a => bySymbol[a.symbol] !== undefined)
            setWatchlistSecIdList(featuredWatchlistItems.map(a => {
                return {
                    symbol: a.symbol,
                    companyName: bySymbol[a.symbol].company_name,
                    imageUri: bySymbol[a.symbol].logo_url,
                    secId: bySymbol[a.symbol].id,
                }
            }))
            
        })()
    }, [])
    
    return (
        <View style={[ flex, { backgroundColor: AppColors.background }]}>
            <Section title="Your Bites" key='audio' style={{paddingTop: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                <View style={{flexDirection: 'row'}}>
                    <SquaredAudioPlayer description={watchlist?.name || ''} track={tracks[0]}  iconUriList={watchlistSecIdList.map(a => a.imageUri)} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}} />
                    <SquaredAudioPlayer description={watchlist?.name || ''} track={tracks[1]} iconUriList={watchlistSecIdList.map(a => a.imageUri)} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}} />
                </View>
            </Section>
            <Section title="Daily Bites" key='audio' style={{paddingTop: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                <View style={{flexDirection: 'row'}}>
                    <SquaredAudioPlayer description={watchlist?.name || ''} track={tracks[0]}  iconUriList={watchlistSecIdList.map(a => a.imageUri)} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}} />
                    <SquaredAudioPlayer description={watchlist?.name || ''} track={tracks[1]} iconUriList={watchlistSecIdList.map(a => a.imageUri)} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}} />
                </View>
            </Section>
            <Section title="Company Bites" key='audio' style={{paddingTop: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                <View style={{flexDirection: 'row'}}>
                    <SquaredAudioPlayer description={watchlist?.name || ''} track={tracks[0]}  iconUriList={watchlistSecIdList.map(a => a.imageUri)} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}} />
                    <SquaredAudioPlayer description={watchlist?.name || ''} track={tracks[1]} iconUriList={watchlistSecIdList.map(a => a.imageUri)} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}} />
                </View>
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