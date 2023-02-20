import React, {RefObject, useEffect, useRef, useState} from "react";
import {Animated, Pressable, View} from "react-native";
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
import {Text,} from "@ui-kitten/components";
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
import {ITextField} from "../../components/TextField";
import {bannerText, flex, noMargin, paddView, sizes, thinBannerText} from "../../style";
import {CreateAccountProps} from "./shared";

import {ScrollWithButtons} from "../../components/ScrollWithButtons";

import WatchlistApi from '@tradingpost/common/api/entities/apis/WatchlistApi'
import NotificationSubscriptionApi from "@tradingpost/common/api/entities/apis/NotificationSubscriptionApi";
import {SvgExpo} from "../../components/SvgExpo";
import AnalyzeImage from '../../assets/analyze2.svg'
import {useWatchlistPicker, WatchlistPicker} from "../../components/WatchlistPicker";
import {ElevatedSection} from "../../components/Section";
import {useLinkTo, useNavigation} from "@react-navigation/native";
import {RootStackScreenProps} from "../../navigation/pages";
import {NotificationSubscriptionTypes} from "@tradingpost/common/notifications/interfaces";

type FieldRefs = {
    first: RefObject<ITextField>,
    last: RefObject<ITextField>,
    username: RefObject<ITextField>
}


export function PickWatchlistSection(props: CreateAccountProps) {
    const nav = useNavigation<RootStackScreenProps<"Create">["navigation"]>();
    const
        [lockButtons, setLockButtons] = useState(false),
        opacityAnim = useRef(new Animated.Value(0)).current,
        {
            selectionConverter: converterRef,
            selectedItems,
            onSelectedItemschanged: setSelectedItems,
            symbolConverter
        } = useWatchlistPicker(),
        linkTo = useLinkTo<any>(),
        buttonConfig = {
            locked: lockButtons,
            left: {
                text: "Not Now",
                onPress: () => {
                    linkTo('/create/analyststart');

                }
            },
            right: {
                text: "Apply",
                onPress: async () => {
                    if (!Object.keys(selectedItems).length) {
                        props.toastMessage("Please select at least one security of interest");
                    } else {
                        setLockButtons(true);
                        try {
                            const newWatchlistRes = await WatchlistApi.insert({
                                items: (converterRef.current ? converterRef.current(selectedItems) : []).map((s) => ({
                                    symbol: s.symbol
                                })),
                                name: "Primary Watchlist",
                                type: "primary" //primary | private | public 
                            });
                            await WatchlistApi.extensions.toggleNotification({
                                id: newWatchlistRes.id,
                                is_notification: true
                            })

                            linkTo('/create/analyststart');
                        } catch (ex: any) {
                            props.toastMessage(ex.message);
                            setLockButtons(false);
                        }
                    }
                }
            }
        }


    useEffect(() => {
        Animated.timing(
            opacityAnim,
            {
                delay: 0.75,
                toValue: 1,
                duration: 1500,
                useNativeDriver: true
            }).start();
    }, [])


    return <ScrollWithButtons
        fillHeight
        buttons={buttonConfig}

    >
        <View style={paddView}>
            <ElevatedSection title="" style={[flex, noMargin]}>
                <Animated.View style={{opacity: opacityAnim}}>
                    <Pressable onPress={() => {
                        nav.navigate("OverlayModal");
                    }}><Text
                        style={[thinBannerText, {marginVertical: sizes.rem0_5}]}>
                        Help us get to know you.
                    </Text>
                    </Pressable>
                    <SvgExpo style={{width: "100%", aspectRatio: 1.5}}>
                        <AnalyzeImage/>
                    </SvgExpo>
                    <Text
                        style={[bannerText, {marginHorizontal: 0, marginVertical: sizes.rem0_5}]}>
                        Pick a few companies to help us tailor to your interests
                    </Text>
                </Animated.View>

                <WatchlistPicker
                    selectionConverter={converterRef}
                    selectedItems={selectedItems}
                    symbolConverter={symbolConverter}
                    onSelectedItemschanged={(_selectedItems) => {
                        setSelectedItems(_selectedItems)
                        //TODO:::: need to put this logic back in 
                        // if (selectedItemCount === 5 && isSelected) {
                        //     props.toastMessage("You can only select up to 5 companies");
                        //     return false;
                        // }
                        // else 
                        // return false;
                    }}
                />
            </ElevatedSection>
        </View>
    </ScrollWithButtons>
}

