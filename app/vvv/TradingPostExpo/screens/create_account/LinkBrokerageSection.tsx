import { Icon, Text } from "@ui-kitten/components";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { AppColors } from "../../constants/Colors";
import { bannerText, flex, paddView, paddViewWhite, sizes, thinBannerText } from "../../style";
import { CreateAccountProps } from "./shared"
import { Bank } from '../../images'
import { SvgExpo } from "../../components/SvgExpo";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";
import { View } from "../../components/Themed";
import { ElevatedSection, Section } from "../../components/Section";
import { useLinkTo } from "@react-navigation/native";
import { LinkBrokerageComponent } from '../../components/LinkBrokerageComponent';

export const LinkBrokerageSection = (props: CreateAccountProps) => {

    const opacityAnim = useRef(new Animated.Value(0)).current;
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

    const linkTo = useLinkTo<any>()
    return <ScrollWithButtons
        fillHeight
        buttons={{
            right: {
                text: "I'm Done Linking Accounts",
                onPress: () => {
                    linkTo('/create/addclaims')
                }
            }
        }}
    >
        <Animated.View style={[paddView, { opacity: opacityAnim }]}>
            <ElevatedSection title={""} style={flex}>
                <Text style={[thinBannerText]}>Link Your Brokerage Accounts.</Text>
                <View style={[{ padding: sizes.rem1 }, flex]}>
                    <Bank />
                </View>
                <Text style={{ marginVertical: sizes.rem1 }}>TradingPost links directly with your bank accounts to ....</Text>
                <View style={flex}> 
                    <LinkBrokerageComponent />
                </View>
                
            </ElevatedSection>
        </Animated.View>
    </ScrollWithButtons >
}