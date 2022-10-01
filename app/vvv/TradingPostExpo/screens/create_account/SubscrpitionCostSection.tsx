import { Icon, Text } from "@ui-kitten/components";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { AppColors } from "../../constants/Colors";
import { bannerText, flex, paddView, paddViewWhite, sizes, thinBannerText } from "../../style";
import { CreateAccountProps } from "./shared"
import Bank from '../../assets/bank.svg'
import { SvgExpo } from "../../components/SvgExpo";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";
import { View } from "../../components/Themed";
import { Api } from "@tradingpost/common/api";
import { ElevatedSection, Section } from "../../components/Section";
import { Table } from "../../components/Table";
import { AddButton, EditButton } from "../../components/AddButton";
import { openBrowserAsync } from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLinkTo } from "@react-navigation/native";
import { SubscriptionSettingsScreen, SubscriptionSettingsView } from "../SubscriptionScreen";

export const SubscriptionCostSection = (props: CreateAccountProps) => {
    // useEffect(() => {
    //     Animated.timing(
    //         opacityAnim,
    //         {
    //             delay: 0.75,
    //             toValue: 1,
    //             duration: 2000,  
    //             useNativeDriver: true
    //         }).start();
    // }, [])
    const submitRef = useRef<{ submit: () => Promise<void> }>({ submit: async () => { } });
    const linkTo = useLinkTo();
    return <ScrollWithButtons
        fillHeight
        buttons={{
            right: {
                text: "Apply Subscription",
                onPress: async () => {
                    await submitRef.current.submit();
                    linkTo('/create/profilepicture')
                }
            }
        }}
    >
        <View style={[paddView,{alignItems:"center", alignContent:"center"}]}>
            <SubscriptionSettingsView submitRef={submitRef} />
        </View>
    </ScrollWithButtons >
}