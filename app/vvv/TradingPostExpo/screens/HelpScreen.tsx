import React, { useEffect, useState } from "react";
import { ScrollView, useWindowDimensions, View, Text } from "react-native";
import { Api, Interface } from "@tradingpost/common/api";
import { elevated, flex, fonts, sizes } from "../style";
import { ClimbingMountain, Studying, Debate } from "../images";
import { AppColors } from "../constants/Colors";
import { ExitButton } from "../components/AddButton";
import { useLinkTo } from "@react-navigation/native";

export function HelpScreen(props: any) {
    const [sliderState, setSliderState] = useState({ currentPage: 0 });
    let { width, height } = useWindowDimensions();
    const linkTo = useLinkTo<any>();
    const setSliderPage = (event: any) => {
      const { currentPage } = sliderState;
      const { x } = event.nativeEvent.contentOffset;
      const indexOfNextScreen = Math.floor(x / width);
      if (indexOfNextScreen !== currentPage) {
        setSliderState({
          ...sliderState,
          currentPage: indexOfNextScreen,
        });
      }
    };
    const paragraphSize = height >= 760 ? fonts.medium : fonts.small
    const { currentPage: pageIndex } = sliderState;

    return <View style={flex}>
        <View style={{zIndex: 1, position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center'}}>
            <ExitButton height={36} width={36} style={{height: 36, width: 36, color: '#708090' }} 
                        onPress={() => {
                            linkTo('/dash/feed')
                        }}/>
            <Text style={{color: '#708090', marginLeft: 10}}>{"Exit Introduction"}</Text>
        </View>
        
        <ScrollView
            style={flex}
            horizontal={true}
            scrollEventThrottle={16}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onScroll={(event: any) => {
                setSliderPage(event);
            }}
        >
            <View style={{ width, height, justifyContent: 'space-between' }}>
                <ClimbingMountain style={{marginTop: '5%',marginHorizontal: 2, height: '45%', width: 'auto'}}/>
                <View style={[elevated, {
                    marginHorizontal: sizes.rem1_5,
                    height: '50%',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    paddingVertical: sizes.rem1
                    //marginVertical: 30,
                }]}>
                    <View style={{justifyContent: 'center', alignItems: 'center', height: '15%',}}>
                        <Text style={{ fontSize: fonts.large, fontFamily: 'K2D', textAlign: 'center', color: AppColors.primary}}>
                            {"Customized Feed"}
                        </Text>
                    </View>
                    
                    <Text style={{padding: sizes.rem1,fontSize: paragraphSize, fontFamily: 'K2D', textAlign: 'center',}}>
                        {"Stock market research from every corner of the internet, all in one place.\n\nContent from Twitter, Substack, Spotify and more currated for you based on stocks you own and are interested in."}
                    </Text>
                </View>
            </View>
            <View style={{ width, height, justifyContent: 'space-between' }}>
                <Studying style={{marginTop: '15%',marginHorizontal: 2, height: '37%', width: 'auto'}}/>
                <View style={[elevated, {
                    marginHorizontal: sizes.rem1_5,
                    height: '50%',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    paddingVertical: sizes.rem1
                    //marginVertical: 30,
                }]}>
                    <View style={{justifyContent: 'center', alignItems: 'center', height: '15%',}}>
                        <Text style={{ fontSize: fonts.large, fontFamily: 'K2D', textAlign: 'center', color: AppColors.primary}}>
                            {"Follow Expert\nTraders and Investors"}
                        </Text>
                    </View>
                    <Text style={{padding: sizes.rem1,fontSize: paragraphSize, fontFamily: 'K2D', textAlign: 'center',}}>
                        {"Subscribe to experts on the platform to learn how they invest and trade.\n\nGain access to articles, charts, trades, and watchlists so you can grow your skills and your wealth."}
                    </Text>
                </View>
            </View>
            <View style={{ width, height, justifyContent: 'space-between' }}>
                <Debate style={{marginTop: '0%',marginHorizontal: 2, height: '45%', width: 'auto'}}/>
                <View style={[elevated, {
                    marginHorizontal: sizes.rem1_5,
                    height: '50%',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                     paddingVertical: sizes.rem1
                    //marginVertical: 30,
                }]}>
                    <View style={{justifyContent: 'center', alignItems: 'center', height: '15%',}}>
                        <Text style={{ fontSize: fonts.large, fontFamily: 'K2D', textAlign: 'center', color: AppColors.primary}}>
                            {"Connect Your\nInvestment Accounts"}
                        </Text>
                    </View>
                    <Text style={{padding: sizes.rem1,fontSize: paragraphSize, fontFamily: 'K2D', textAlign: 'center',}}>
                        {"Connect your portfolio to TradingPost and control who can view your articles, charts, trades, and watchlists.\n\nMake it public, share with friends and family, or build a paying subscriber base."}
                    </Text>
                </View>
            </View>
        </ScrollView>
        <View style={{
                position: 'relative',
                bottom: '10%',
                left: 0,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
            }}
        >
            {Array.from(Array(3).keys()).map((key, index) => (
                <View style={[{
                        height: 10,
                        width: 10,
                        borderRadius: 10 / 2,
                        backgroundColor: AppColors.secondary,
                        marginLeft: 10,
                        opacity: pageIndex === index ? 1 : 0.2 }]} 
                    key={index} 
                />
                ))}
        </View>
    </View>
}