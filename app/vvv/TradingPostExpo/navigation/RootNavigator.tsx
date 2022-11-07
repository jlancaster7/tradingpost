import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Button, Keyboard, Pressable, View } from "react-native";
import { AppTitle } from "../images";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import { sizes } from "../style";
import { DrawerPart } from "./DrawerNavigator";
import { RootStackParamList } from "./pages";
import { AccountSettingsScreen } from "../screens/AccountSettingsScreen"
import { AccountInfoScreen } from "../screens/AccountInfoScreen";
import { AuthScreen } from "../screens/AuthScreen"
import { ChangePasswordScreen } from "../screens/ChangePasswordScreen"
import { CompanyScreen } from "../screens/CompanyScreen"
import { ImagePickerScreen } from "../screens/ImagePicker"
import ModalScreen from "../screens/ModalScreen"
import { NotificationTradeScreen } from "../screens/NotificationTradeScreen"
import { PostEditorScreen } from "../screens/PostEditorScreen"
import { PostScreen } from "../screens/PostScreen"
import { SubscriptionScreen, SubscriptionSettingsScreen } from "../screens/SubscriptionScreen"
import { TableModalScreen } from "../screens/TableModalScreen"
import { VerificationScreen } from "../screens/VerificationScreen"
import { WatchlistEditorScreen } from "../screens/WatchlistEditorScreen"
import { WatchlistScreen } from "../screens/WatchlistScreen"
import { WatchlistViewerScreen } from "../screens/WatchlistViewerScreen"
import { AppInformationScreen } from "../screens/AppInformationScreen";
import * as Notifications from 'expo-notifications';
import { useIsKeyboardVisible } from "../utils/hooks";
import { IconButton } from "../components/IconButton";
import { IconifyIcon } from "../components/IconfiyIcon";
import KeyboardClose from '../assets/@iconify/keyboard-close'
import { useLinkTo } from "@react-navigation/native";
import { useEffect, } from "react";
import { Text } from 'react-native'
import { useAppUser } from "../Authentication";
import { Log } from "../utils/logger";


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
    }),
});

export const Stack = createNativeStackNavigator<RootStackParamList>();



export const useInitialRoute = () => {
    let { loginState } = useAppUser();
    let initialRoute: keyof RootStackParamList;
    if (loginState?.appUser)
        //TODO: Should refactor this so that it is more related... settings + settings.analyst + analyst_profile
        if (loginState.setupStatus?.needsAnalystSettings || loginState.setupStatus?.needsSettings)
            initialRoute = "Create"
        else if (!loginState.loginResult?.verified)
            initialRoute = "VerifyAccount"
        else
            initialRoute = "Dash"
    else if (loginState?.loginResult)
        initialRoute = "Create"

    else
        initialRoute = "Root"

    Log.verbose(`Initial Route Is : '${initialRoute}'`);
    return initialRoute;
}

export function RootNavigator() {
    console.log("Running Root Navigation");
    return <Stack.Navigator
        initialRouteName={useInitialRoute()}
        screenOptions={{
            headerTitle: () => <AppTitle height={"100%"}
                style={{ marginTop: sizes.rem0_5, height: sizes.rem2, aspectRatio: 5.77 }}
            />,
            headerTitleAlign: "center",
            headerBackVisible: false,
        }}>
        <Stack.Screen name="Root" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Create" component={CreateAccountScreen}
            options={{ headerShown: false, headerBackVisible: false }} />
        <Stack.Screen name="Dash" component={DrawerPart} options={{
            headerShown: false,
        }} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
        <Stack.Group screenOptions={{
            headerBackVisible: true,
        }}>
            <Stack.Screen name="ResetPassword" component={ChangePasswordScreen} />
            <Stack.Screen name="VerifyAccount" component={VerificationScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
            <Stack.Screen name="AccountInformation" component={AccountInfoScreen} />
            <Stack.Screen name="AppInformation" component={AppInformationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SubscriptionSettings" component={SubscriptionSettingsScreen} />
            <Stack.Screen name="WatchlistEditor" component={WatchlistEditorScreen} />
            <Stack.Screen name="PostScreen" component={PostScreen} />
            <Stack.Screen name="PostEditor" component={PostEditorScreen} />
            <Stack.Screen name="WatchlistViewer" component={WatchlistViewerScreen} />
            <Stack.Screen name="Watchlist" component={WatchlistScreen} />
            <Stack.Screen name="ImagePicker" component={ImagePickerScreen} />
            <Stack.Screen name="Company" component={CompanyScreen} />
            <Stack.Screen name="TableModal" component={TableModalScreen} />
            <Stack.Screen name="NotificationTrade" component={NotificationTradeScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{
            presentation: "modal",
            headerStyle: {
                backgroundColor: "transparent"
            },
            headerTintColor: "white",
            headerBackground: () => <View></View>,
            headerTitle: "",
            contentStyle: {
                marginTop: -64
            }
        }}>
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Group>
    </Stack.Navigator>
}




