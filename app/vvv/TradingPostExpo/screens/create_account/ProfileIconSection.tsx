import { Icon, Text } from "@ui-kitten/components";
import { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { AppColors } from "../../constants/Colors";
import { bannerText, sizes, thinBannerText } from "../../style";
import { CreateAccountProps, sideMargin } from "./shared"
import { Api } from "@tradingpost/common/api";
import { ProfileButton } from "../../components/ProfileButton";
import { ElevatedSection } from "../../components/Section";
import { useData } from "../../lds";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import React from "react";
export const ProfileIconSection = (props: CreateAccountProps) => {
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const { value: hasAuthed, setValue } = useData("hasAuthed");

    const nav = useNavigation();
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
        buttons={{
            right: {
                text: "Go To Trading Post!",
                onPress: () => {
                    setValue(true);
                    nav.navigate("AppInformation");

                    //linkTo('/dash/feed')
                }
            },

        }}
    >
        <Animated.View style={{ opacity: opacityAnim, padding: sideMargin }} >
            <ElevatedSection title="">
                <Text style={[thinBannerText]}>Tap to Modify Profile Picture</Text>
                <ProfileButton userId={props.user.data.id} profileUrl="" size={sizes.rem16} editable />
                <Text style={[thinBannerText]}>Tip: Profile pictures will help others quickly identify you when on the platform.</Text>
            </ElevatedSection>
        </Animated.View>
    </ScrollWithButtons>
}