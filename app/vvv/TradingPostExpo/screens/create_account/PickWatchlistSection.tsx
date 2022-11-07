import React, { useState, useRef, useEffect, RefObject, useMemo } from "react";
import { Alert, TouchableOpacity, Image, ImageStyle, ViewStyle, View, Animated, Pressable } from "react-native";
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
import { Avatar, Icon, Input, Text, } from "@ui-kitten/components";
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
import { TextField, ITextField } from "../../components/TextField";
import { bannerText, flex, noMargin, paddView, sizes, textInputWiz, thinBannerText } from "../../style";
import { isRequired, isValidEmail, isAlphaNumeric } from "../../utils/validators";
import { CreateAccountProps, sideMargin, useChangeLock } from "./shared";

import { ScrollWithButtons } from "../../components/ScrollWithButtons";

import WatchlistApi from '@tradingpost/common/api/entities/apis/WatchlistApi'
import { SvgExpo } from "../../components/SvgExpo";
import AnalyzeImage from '../../assets/analyze2.svg'
import { useWatchlistPicker, WatchlistPicker } from "../../components/WatchlistPicker";
import { ElevatedSection } from "../../components/Section";
import { useLinkTo } from "@react-navigation/native";

type FieldRefs = {
    first: RefObject<ITextField>,
    last: RefObject<ITextField>,
    username: RefObject<ITextField>
}


export function PickWatchlistSection(props: CreateAccountProps) {
    const
        [lockButtons, setLockButtons] = useChangeLock(props),
        opacityAnim = useRef(new Animated.Value(0)).current,
        { selectionConverter: converterRef, selectedItems, onSelectedItemschanged: setSelectedItems, symbolConverter } = useWatchlistPicker(),
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
                    }
                    else {
                        setLockButtons(true);
                        try {
                            await WatchlistApi.insert({
                                items: (converterRef.current ? converterRef.current(selectedItems) : []).map((s) => ({
                                    symbol: s.symbol
                                })),
                                name: "Primary Watchlist",
                                type: "primary" //primary | private | public 
                            })
                            linkTo('/create/analyststart');
                        }
                        catch (ex: any) {
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
                <Animated.View style={{ opacity: opacityAnim }}>
                    <Pressable onPress={() => {
                        props.navigation.navigate("OverlayModal");
                    }}><Text
                        style={[thinBannerText, { marginVertical: sizes.rem0_5 }]}>
                            Help us get to know you.
                        </Text>
                    </Pressable>
                    <SvgExpo style={{width:"100%", aspectRatio:1.5}}>
                        <AnalyzeImage />
                    </SvgExpo>
                    <Text
                        style={[bannerText, { marginHorizontal: 0, marginVertical: sizes.rem0_5 }]}>
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

