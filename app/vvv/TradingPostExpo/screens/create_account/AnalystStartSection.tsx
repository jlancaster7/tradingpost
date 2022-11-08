import { Icon, Text } from "@ui-kitten/components";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { AppColors } from "../../constants/Colors";
import { bannerText, flex, fonts, paddView, sizes, thinBannerText } from "../../style";
import Analytics from '../../assets/analytics.svg'
import { SvgExpo } from "../../components/SvgExpo";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { View } from "../../components/Themed";
import { ElevatedSection } from "../../components/Section";
import { useLinkTo } from "@react-navigation/native";
import { CreateAccountProps } from "./shared";
import { Api } from "@tradingpost/common/api"
import React from "react";


export const AnalystStartSection = (props: CreateAccountProps) => {

    const opacityAnim = useRef(new Animated.Value(0)).current,
        linkTo = useLinkTo<any>();
    useEffect(() => {
        Animated.timing(
            opacityAnim,
            {
                delay: 0.75,
                toValue: 1,
                duration: 2000,
                useNativeDriver: true
            }).start();
    }, [])

    return <ScrollWithButtons
        fillHeight
        buttons={{
            right: {
                text: "I'm An Analyst",
                onPress: async () => {
                    const defaultSettings = {
                        analyst: true,
                        push_notifications: {
                            mentions: true,
                            upvotes: true,
                            watchlist_changes: true,
                        },
                        portfolio_display: {
                            performance: true,
                            holdings: true,
                            trades: true
                        }
                    }
                    await Api.User.update(props.user.data.id, {
                        settings: defaultSettings
                    })
                    linkTo("/create/analystinterest");
                }
            },
            left: {
                text: "Not Now",
                onPress: async () => {
                    const defaultSettings = {
                        analyst: false,
                        push_notifications: {
                            mentions: true,
                            upvotes: true,
                            watchlist_changes: true,
                        },
                        portfolio_display: {
                            performance: false,
                            holdings: false,
                            trades: false
                        }
                    }
                    await Api.User.update(props.user.data.id, {
                        settings: defaultSettings
                    })
                    linkTo("/create/profilepicture");
                }
            }
        }}
    >
        <View style={[paddView, { justifyContent: "center" }]}>
            <ElevatedSection title="">
                <Animated.View style={[{ opacity: opacityAnim }]}>
                    <Text style={[thinBannerText]}>Are you a Market Analyst?</Text>
                    <View style={{ padding: sizes.rem1 }}>
                        <SvgExpo style={{ width:"100%", aspectRatio:1.5}}>
                            <Analytics />
                        </SvgExpo>
                    </View>
                    <Text style={[thinBannerText, { fontSize: fonts.medium }]}>Select Analyst if you actively post fundamental or technical research related to stocks, commodities, crypto, etc. and would like to bolster your content.</Text>
                </Animated.View>
            </ElevatedSection>
        </View>
    </ScrollWithButtons>
}