import React, { useState, useRef, useEffect, RefObject, useMemo } from "react";
import { Alert, TouchableOpacity, Image, ImageStyle, ViewStyle, View, Animated } from "react-native";
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
import { Input, Text, } from "@ui-kitten/components";
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
import { ButtonField } from "../../components/ButtonField";
import { IconifyIcon } from "../../components/IconfiyIcon";
import { Section } from "../../components/Section";
import { TextField, ITextField } from "../../components/TextField";
import { bannerText, flex, sizes, textInputWiz } from "../../style";
import { bindTextInput, IEntity, useReadonlyEntity } from "../../utils/hooks";
import { isRequired, isValidEmail, isAlphaNumeric } from "../../utils/validators";
import { CreateAccountProps, sideMargin } from "./shared";

import { ScrollWithButtons } from "../../components/ScrollWithButtons";
import { useData } from "../../lds";
import { Label } from "../../components/Label";
import { TBI } from "../../utils/misc";
import { AppColors } from "../../constants/Colors";
import Auth from '@tradingpost/common/api/entities/static/AuthApi'
import UserApi from '@tradingpost/common/api/entities/apis/UserApi'
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { useAppUser } from "../../Authentication";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import { registerDeviceForNotifications } from "../../utils/notifications";
import { HtmlView } from "../../components/HtmlView";




export function TermsScreen(props: CreateAccountProps) {
    const
        nav = useNavigation(),
        [lockButtons, setLockButtons] = useState(false),
        opacityAnim = useRef(new Animated.Value(0)).current,
        linkTo = useLinkTo(),
        buttonConfig = {
            locked: lockButtons,
            right: {
                text: "Go Back",
                onPress: async () => {
                    linkTo("/create/logininfo")
                }
            }

        }

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
        buttons={buttonConfig}>
        <HtmlView
            style={{ flex: 1 }}
            isUrl
        >{"https://tradingpostapp.com/terms-of-service"}</HtmlView>
    </ScrollWithButtons>
}
