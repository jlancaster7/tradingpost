import React from "react"
//import { Stack } from "./RootNavigator"
import { View } from 'react-native'
import { ProfileScreen } from "../screens/ProfileScreen"
import { AccountSettingsScreen } from "../screens/AccountSettingsScreen"
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

export const ModalStackGroup = (Stack: any) => {
    return <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="ResetPassword" component={ChangePasswordScreen} />
        <Stack.Screen name="VerifyAccount" component={VerificationScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
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
}
export const TransparentModalStackGroup = (Stack: any) => {
    return <Stack.Group screenOptions={{
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
}