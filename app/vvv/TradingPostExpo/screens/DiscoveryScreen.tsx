
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
import { IUserList } from "@tradingpost/common/api/entities/interfaces";
import { ProfileButton } from "../components/ProfileButton";
import { OverlappingIconCollage } from "../components/OverlappingIconCollage";
import { OverlappingIconList } from "../components/OverlappingIconList";
//import { SquaredAudioPlayer } from "../components/SquaredAudioPlayer";
//import TrackPlayer from 'react-native-track-player';
import { useNavigation } from "@react-navigation/core";

export const DiscoveryScreen = () => {
    const {securities: {bySymbol, byId}} = useSecuritiesList();
    const nav = useNavigation()
    const [watchlistSecIdList, setWatchlistSecIdList] = useState<{symbol: string, companyName: string, imageUri: string, secId: number}[]>([])

    useEffect(() => {
        (async () => {
            
            
            const featuredWatchlist = await Api.Watchlist.get(120)
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
            <Animated.FlatList key={'discovery list'}
                data={[
                
                    
                <Section key="writers" alt={true} title="Writers" style={{paddingTop: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                    <LimitedBlockList
                        listKey="writers_table"
                        key={'writers_table'}
                        maxPage={0}
                        title={'Writers'}
                        listProps={{
                            keyExtractor: (item: any, idx) => {
                                
                                return item ? "writer_" + item.handle : "empty";
                            },
                            datasetKey: `writer_id_`,
                            data: async (a, $page, $limit) => {
                                const newArr = a || [];
                                newArr.push(...(await Api.User.extensions.discoveryOne({page: $page, limit: 4})))
                                return newArr;
                            },
                            loadingMessage: " ",
                            noDataMessage: " ",
                            loadingItem: undefined,
                            numColumns: 1,
                            renderItem: (item: any) => {
                                return (
                                    <Pressable onPress={() => {
                                        nav.navigate("Profile", {
                                            userId: item.item.id
                                        });
                                    }}>
                                        <ElevatedSection title="" style={{flex: 1, flexDirection: 'row'}}>
                                            <ProfileButton userId={item.item.id || ""} profileUrl={item.item.profile_url || ""} size={sizes.rem6 / 2.1}/>
                                            <View style={{flex: 1, marginLeft: sizes.rem0_5, justifyContent: 'center'}}>
        
                                                <Text style={{ fontWeight: '700', fontSize: fonts.small}}>{item.item.title}</Text>
                                                <Text numberOfLines={2} style={{fontSize: fonts.xSmall}}>{item.item.description}</Text>
                                            </View>
                                        </ElevatedSection>
                                    </Pressable>

                                )
                            }
                        }
                        }
                    />
                </Section>,
                <Section key="podcasts" alt={true} title="Podcasters" style={{paddingVertical: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                    <LimitedBlockList
                        listKey="podacast_table"
                        key={'podcast_table'}
                        maxPage={0}
                        title={'Podcasts'}
                        listProps={{
                            keyExtractor: (item: any, idx) => {
                                
                                return item ? "writer_" + item.handle : "empty";
                            },
                            datasetKey: `writer_id_`,
                            data: async (a, $page, $limit) => {
                                const newArr = a || [];
                                newArr.push(...(await Api.User.extensions.discoveryTwo({page: $page, limit: 4})))
                                return newArr;
                            },
                            loadingMessage: " ",
                            noDataMessage: " ",
                            loadingItem: undefined,
                            numColumns: 1,
                            renderItem: (item: any) => {
                                return (
                                    <Pressable onPress={() => {
                                        nav.navigate("Profile", {
                                            userId: item.item.id
                                        });
                                    }}>
                                        <ElevatedSection title="" style={{flex: 1, flexDirection: 'row'}}>
                                            <ProfileButton userId={item.item.id || ""} profileUrl={item.item.profile_url || ""} size={sizes.rem6 / 2.1}/>
                                            <View style={{flex: 1, marginLeft: sizes.rem0_5, justifyContent: 'center'}}>
        
                                                <Text style={{ fontWeight: '700', fontSize: fonts.small}}>{item.item.title}</Text>
                                                <Text numberOfLines={2} style={{fontSize: fonts.xSmall}}>{item.item.description}</Text>
                                            </View>
                                        </ElevatedSection>
                                    </Pressable>
                                )
                            }
                        }
                        }
                    />
                </Section>
                ]}
                renderItem={(info) => {
                    return info.item
                }} />


           
        </View>
    )
}

/* //const [watchlistSecIdList, setWatchlistSecIdList] = useState<{symbol: string, companyName: string, imageUri: string, secId: number}[]>([])

    useEffect(() => {
        (async () => {
            console.log('adding track')
            await TrackPlayer.reset()
            await TrackPlayer.add([{
                url: 'https://tradingpost-audio-files.s3.us-east-1.amazonaws.com/nicksPortfolio-3-3-23.5953c4c1-80d9-413f-85f9-6e546fa9693f.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBwaCXVzLWVhc3QtMiJIMEYCIQDsLu4k9vXlZbh%2BXk9b73si0v%2BWZoRwnQHJPNTK6FB1pgIhAJhMs9IN1A5%2Fl9P%2Bh2Yrf1v5bITgt9B73iH2RuwPt6qvKvECCMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjcwMTcxNDA3Mzc1IgyIYV%2FnGEDvdKbYRsAqxQKldHWPGgiwkMr2R6ZfFvxLrGsNaMHwejusLcMt8zPmW4ZjC4la3XTtvtcKElLiUoQFYy9DRlyOgnzoe0ek8eOO5RGe%2BCqmUPEfJyotOHunmGp6UXxITGGqFGByoAUhmjhND5q5zSksBNnE9hvUpv%2FoM2wjjZzNx7t7C1Lrd0v34dtvl7FH4ZbV7uJt7s7KPy%2B%2BPnpDsGK7I4KMbXgayM5mYAqoogH0VJb3A3r48zH35p6glNYiBMQk6UQILGAlYSmkbvZoURmJfVDEOjjO3i%2FGrQ4hIwgPxR96KN49p1E12lwYzB2cwsXpMFdBgVqsK%2B%2Fmxp%2BQuFPwM%2BdRvvQEDOD%2BXbpAQ4aSJjDGXJd07wEdCxCQsdSRKd66DdE2%2FgSKv%2FEJMzsxOw8WIhOcg5O9zwA9Oyzm997Nw%2FEn6XIVOukZ2RODgDMaMOmqiaAGOrICYKRM5ncdzlxenp0WwnAWEp5MC6MpBzPxY4RvVwUA0%2BJIRQEn5IUjjtmXfALGaouvPS%2FgOQ295QWSRDeRJ9yEaSfjx0U51eYFzMaoOlPszoCPRgLbmp25nm9j6oKAhieONPXszZFLd0yoxwAO5PJOoJ0o8X3YQu8Witzh2BvXRqSdHluOJ%2Fvs7ofttHsH%2FdB60CrPEE4Klimad7dtOsXj%2BKreCxi9treDDhO3p2UsdwT4lWMTDN1uU9mULbJKmMJixyuw%2FZ66U%2Ba97uSB5QxrNj37uZUDK36Rtm28NQBvUU1MykDWFGrJ9gVB4oLSDBcGpxCt4rR2%2FiPjMJQJy5vwqXI45Xfl01M%2BIyAQhQ6uN7pBob9bt5iddSI12Mbw3DZr9Q5jz1c%2FiyAICwUZ2WZVwKOI&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230304T002803Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=ASIAZYCKUEQHQ67PLKMA%2F20230304%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=503845dda9e02a527d4a5382453cf38c86da0d7edcbf985af242880bc44aa5b8', 
                title: 'Test', 
                artist: 'TradingPost News'
            }, 
            {
                url: 'https://tradingpost-audio-files.s3.us-east-1.amazonaws.com/LEAT-Summary.51ac2cc2-eb46-445d-b88f-779ab2bbddb5.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBwaCXVzLWVhc3QtMiJIMEYCIQDsLu4k9vXlZbh%2BXk9b73si0v%2BWZoRwnQHJPNTK6FB1pgIhAJhMs9IN1A5%2Fl9P%2Bh2Yrf1v5bITgt9B73iH2RuwPt6qvKvECCMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjcwMTcxNDA3Mzc1IgyIYV%2FnGEDvdKbYRsAqxQKldHWPGgiwkMr2R6ZfFvxLrGsNaMHwejusLcMt8zPmW4ZjC4la3XTtvtcKElLiUoQFYy9DRlyOgnzoe0ek8eOO5RGe%2BCqmUPEfJyotOHunmGp6UXxITGGqFGByoAUhmjhND5q5zSksBNnE9hvUpv%2FoM2wjjZzNx7t7C1Lrd0v34dtvl7FH4ZbV7uJt7s7KPy%2B%2BPnpDsGK7I4KMbXgayM5mYAqoogH0VJb3A3r48zH35p6glNYiBMQk6UQILGAlYSmkbvZoURmJfVDEOjjO3i%2FGrQ4hIwgPxR96KN49p1E12lwYzB2cwsXpMFdBgVqsK%2B%2Fmxp%2BQuFPwM%2BdRvvQEDOD%2BXbpAQ4aSJjDGXJd07wEdCxCQsdSRKd66DdE2%2FgSKv%2FEJMzsxOw8WIhOcg5O9zwA9Oyzm997Nw%2FEn6XIVOukZ2RODgDMaMOmqiaAGOrICYKRM5ncdzlxenp0WwnAWEp5MC6MpBzPxY4RvVwUA0%2BJIRQEn5IUjjtmXfALGaouvPS%2FgOQ295QWSRDeRJ9yEaSfjx0U51eYFzMaoOlPszoCPRgLbmp25nm9j6oKAhieONPXszZFLd0yoxwAO5PJOoJ0o8X3YQu8Witzh2BvXRqSdHluOJ%2Fvs7ofttHsH%2FdB60CrPEE4Klimad7dtOsXj%2BKreCxi9treDDhO3p2UsdwT4lWMTDN1uU9mULbJKmMJixyuw%2FZ66U%2Ba97uSB5QxrNj37uZUDK36Rtm28NQBvUU1MykDWFGrJ9gVB4oLSDBcGpxCt4rR2%2FiPjMJQJy5vwqXI45Xfl01M%2BIyAQhQ6uN7pBob9bt5iddSI12Mbw3DZr9Q5jz1c%2FiyAICwUZ2WZVwKOI&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230304T002838Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7199&X-Amz-Credential=ASIAZYCKUEQHQ67PLKMA%2F20230304%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4511c6a51d5ffa3a081135acf0992607ec4ffc72af0860eba8471e731db75d1c', 
                title: 'Test', 
                artist: 'TradingPost News'
            }])
            
            const featuredWatchlist = await Api.Watchlist.get(120)
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
*/

{/*<Section title="Bites" key='audio' style={{paddingTop: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
<View style={{flexDirection: 'row'}}>
    <SquaredAudioPlayer trackNumber={0} iconSize={'small'} description={"S&P 500 Tech Sector\n$XLK"} iconUriList={testImageList} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}}/>
    <SquaredAudioPlayer trackNumber={1} iconSize={'small'} description={"ARK Innovation Fund\n$ARKK"} iconUriList={testImageList} maxIcons={7} viewStyle={{paddingVertical: sizes.rem0_5}}/>
</View>
</Section>,*/}


{/*
<Section key="trending_stocks" alt={true} title="Trending" style={{paddingTop: sizes.rem0_5,paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                        <List
                            //key={`objKey_${watchlistSecIdList?.length}`}
                            
                            listKey={`companies_${watchlistSecIdList?.length}`}
                            datasetKey={`company_id_${watchlistSecIdList?.length}`}
                            horizontal
                            data={watchlistSecIdList}
                            loadingMessage={" "}
                            noDataMessage={" "}
                            loadingItem={undefined}
                            renderItem={(item) => {
                                return (
                                    <CompanyProfileBar symbol={item.item.symbol}
                                                        companyName={item.item.companyName} 
                                                        imageUri={item.item.imageUri}
                                                        secId={item.item.secId}
                                                        makeShadedSec/>
                                )
                            }}
                        />
                </Section>,
                <Section key="Recently Mentioned" alt={true} title="Recently Mentioned" style={{paddingTop: sizes.rem0_5, paddingHorizontal: sizes.rem1, marginBottom: 0}}>
                    <List
                        //key={`objKey_${watchlistSecIdList?.length}`}
                        
                        listKey={`companies_${watchlistSecIdList?.length}`}
                        datasetKey={`company_id_${watchlistSecIdList?.length}`}
                        horizontal
                        data={watchlistSecIdList}
                        loadingMessage={" "}
                        noDataMessage={" "}
                        loadingItem={undefined}
                        renderItem={(item) => {
                            return (
                                <CompanyProfileBar symbol={item.item.symbol}
                                                    companyName={item.item.companyName} 
                                                    imageUri={item.item.imageUri}
                                                    secId={item.item.secId}
                                                    makeShadedSec/>
                                
                            )
                        }}
                    />
                </Section>,
*/}