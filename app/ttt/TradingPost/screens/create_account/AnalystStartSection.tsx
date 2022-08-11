import { Icon, Text } from "@ui-kitten/components";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { AppColors } from "../../constants/Colors";
import { bannerText, flex, fonts, paddView, sizes, thinBannerText } from "../../style";
import { CreateAccountProps } from "../CreateAccountScreen"
import Analytics from '../../assets/analytics.svg'
import { SvgExpo } from "../../components/SvgExpo";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { View } from "../../components/Themed";
import { ElevatedSection } from "../../components/Section";



export const AnalystStartSection = (props: CreateAccountProps) => {

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

    return <ScrollWithButtons
        fillHeight
        buttons={{
            right: {
                text: "I'm An Analyst",
                onPress: () => {
                    props.navigateByName("Analyst Interest");
                }
            },
            left: {
                text: "Not Now",
                onPress: () => {
                    //need to change this to skip 2 
                    props.navigateByName("Profile Picture");
                }
            }
        }}
    >
        <View style={[paddView, { justifyContent: "center" }]}>
            <ElevatedSection title="">
                <Animated.View style={[{ opacity: opacityAnim }]}>
                    <Text style={[bannerText]}>Are you a Market Analyst?</Text>
                    <View style={{ padding: sizes.rem1 }}>
                        <SvgExpo>
                            <Analytics />
                        </SvgExpo>
                    </View>
                    <Text style={[thinBannerText, { fontSize: fonts.medium }]}>Select Analyst if you actively post fundamental or technical research related to stocks, commodities, crypto, etc. and would like to bolster your content.</Text>
                </Animated.View>
            </ElevatedSection>
        </View>
    </ScrollWithButtons>
}