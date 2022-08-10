import React, { useState, useRef, useEffect, RefObject, useMemo } from "react";
import { Alert, TouchableOpacity, Image, ImageStyle, ViewStyle, View, Animated } from "react-native";
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
import { Avatar, Input, Text, } from "@ui-kitten/components";
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
import { TextField, ITextField } from "../../components/TextField";
import { bannerText, flex, sizes, textInputWiz } from "../../style";
import { bindTextInput, IEntity, useReadonlyEntity } from "../../utils/hooks";
import { isRequired, isValidEmail, isAlphaNumeric } from "../../utils/validators";
import { CreateAccountProps, sideMargin, useChangeLock } from "../CreateAccountScreen";

import { ScrollWithButtons } from "../../components/ScrollWithButtons";
import { ProfileBanner } from "../../components/ProfileBanner";
import { Label } from "../../components/Label";
import { TBI } from "../../utils/misc";
import { AppColors } from "../../constants/Colors";
import Auth from '@tradingpost/common/api/entities/static/AuthApi'
import SecurityApi, { ISecurityList } from '@tradingpost/common/api/entities/static/SecurityApi'
import { useAppUser } from "../../App";
import { List } from "../../components/List";
import { SearchBar } from "../../components/SearchBar";
import { LogoImage } from "../../components/LogoImage";


type FieldRefs = {
    first: RefObject<ITextField>,
    last: RefObject<ITextField>,
    username: RefObject<ITextField>
}

//TODO: Need to optimize security load

export function BasicInfoSection(props: CreateAccountProps) {
    const
        [lockButtons, setLockButtons] = useChangeLock(props),
        opacityAnim = useRef(new Animated.Value(0)).current,
        [selectedSecs, setSelectedSecs] = useState<number[]>([]),
        refs: FieldRefs = {
            first: useRef<ITextField>(null),
            last: useRef<ITextField>(null),
            username: useRef<ITextField>(null),
        },
        buttonConfig = {
            locked: lockButtons,
            left: {
                text: "Not Now",
                onPress: () => {
                    props.next();
                }
            },
            right: {
                text: "Apply",
                onPress: () => {
                    if (!selectedSecs.length)
                        props.toastMessage("Please select at least one security of interest");
                    else
                        props.next();
                }
            }
        },
        [securities, setSecurities] = useState<ISecurityList[]>([])

    useEffect(() => {
        Animated.timing(
            opacityAnim,
            {
                delay: 0.75,
                toValue: 1,
                duration: 2000,
                useNativeDriver: true
            }).start();

        (async () => {
            try {
                setSecurities(await SecurityApi.list());
            }
            catch (ex: any) {
                props.toastMessage(ex.message);
            }
        })()
    }, [])
    useEffect(() => {
        if (props.saveOnly)
            setLockButtons(!props.user.hasChanged);
    }, [props.saveOnly, props.user.hasChanged]);

    return <ScrollWithButtons
        buttons={buttonConfig}>
        <View>
            <SearchBar onTextChange={(text) => {

            }} onLayout={undefined} />
            <List data={securities} renderItem={(i) => {
                return <View style={{ height: 80, width: 80, backgroundColor: "green" }}>
                    <Avatar shape='square' source={{ uri: i.item.logo_url }} size="giant" />
                </View>
            }}
                loadingItem={undefined} />
        </View >
    </ScrollWithButtons >
}
