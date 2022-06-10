import React, { Component, MutableRefObject, PropsWithChildren, Ref, useCallback, useRef, useState } from "react";
import { ComponentProvider, Pressable, SafeAreaView, ScrollView, StyleProp, Text, ViewStyle } from "react-native";
import { Layout, LayoutComponent, Navigation } from "react-native-navigation";
import { Button, Dialog, DialogProps, Image, Toast, TouchableOpacityProps, View } from "react-native-ui-lib";
import { Header } from "../components/Headers";
import { LogoImage } from "../components/LogoImage";
import { LogoTitleImage } from "../components/LogoTitleImage";
import { flex, shadow, sizes } from "../style";
import { ToastMessageFunction, useToast } from "../utils/hooks";

import { SideMenu } from "../components/SideMenu";
//import { LoginScreen } from "../screens/LoginScreen";
//import { MenuButton } from "./layouts/DashboardLayout";
//import { CreateAccountScreen } from "../screens/CreateAccountScreen";
import { SvgProps } from "react-native-svg";
import { topBarIcons } from "../images";
// import { BookmarkScreen, FeedScreen } from "./screens/FeedScreen";
// import { NotificationScreen } from "./screens/NotificationScreen";
// import { FeedFilterScreen } from "./screens/FeedFilterScreen";
// import { PostScreen } from "./screens/PostScreen";
// import { ManageSubscriptionsScreen } from "./screens/ManageSubscriptionsScreen";
// import { ProfileScreen } from "./screens/ProfileScreen";
// import { PortfolioScreen } from "./screens/PortfolioScreen";
// import { WatchlistsScreen } from "./screens/WatchlistsScreen";
// import { CompetitionsScreen } from "./screens/CompetitionsScreen";
// import { FeedbackScreen } from "./screens/FeedbackScreen";
import { ImagePickerScreen } from "../screens/ImagePickerScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
// import { NewPostScreen } from "./screens/NewPostScreen";
// import { UpsertWatchlistScreen } from "./screens/UpsertWatchListScreen";
// import { WatchlistScreen } from "./screens/WatchlistScreen";
// import { CompanyScreen } from "./screens/CompanyScreen";
// import { DiscoveryScreen } from "./screens/DiscoveryScreen";
export function SetPublicLayout(isLoggedIn?: boolean) {
    Navigation.setDefaultOptions({
        topBar: {
            visible: false
        }
    })
    Navigation.setRoot({
        root: {
            stack: {
                children: [WelcomeScreen.getLayout()]
            }
        }
    });
}

type MenuButtonProps = SvgProps & { componentId: string, rootTag: number } & Pick<TouchableOpacityProps, "onPress">;
export function MenuButton(props: MenuButtonProps) {
    return <Pressable android_ripple={{
        color: "lightgray",
        radius: 20,
        foreground: false
    }} onPress={props.onPress} style={{ display: "flex", marginLeft: 8, height: 40, width: 40, padding: 12 }}><Image source={topBarIcons.menu} style={{ height: 16, width: 16 }} /></Pressable>
}
export type DashProps = { componentId: string, isFullscreen?: boolean }
export interface PromptConfig {
    title: string,
    message: string,
    buttons?: PromptButton[]
}

export interface PromptButton {
    text: string,
    backgroundColor?: string,
    textColor?: string,
    onPress: (dialog: IDialog) => void
}
export type PromptFunc = (title: string, message: string, buttons: PromptButton[]) => Ref<IDialog>;
export interface IDashboard {
    toastMessage: ToastMessageFunction,
    prompt: PromptFunc
}
export type IDialog = {
    hideDialogView: () => void
} & Component<DialogProps>

export type BaseScreenProps = { viewStyle?: StyleProp<ViewStyle>, dashboardRef?: MutableRefObject<IDashboard | undefined>, title?: string, scrollContentFlex?: boolean };

export function BaseScreen(props: PropsWithChildren<BaseScreenProps>) {
    const { children, viewStyle, title, scrollContentFlex } = props,
        { toastMessage, toastProps } = useToast(),
        prompRef = useRef<IDialog>(null),
        [promptProps, setPromptProps] = useState<DialogProps & { _message?: string, _title?: string, _buttons?: PromptButton[] }>(),
        dashboardRef = useRef<IDashboard>({
            toastMessage,
            prompt: useCallback((_title, _message, _buttons) => {
                setPromptProps({
                    _title,
                    _message,
                    _buttons,
                    visible: true,
                    panDirection: "down",
                });
                return prompRef;
            }, [])
        });

    // const [isKeyboardShown, setKeyboardStatus] = useState(false);

    // useLayoutEffect(() => {
    //     const
    //         showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardStatus(true)),
    //         hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardStatus(false));
    //     return () => {
    //         showSubscription.remove();
    //         hideSubscription.remove();
    //     };
    // }, []);
    if (props.dashboardRef) {
        props.dashboardRef.current = dashboardRef.current;
    }


    return (
        <SafeAreaView style={[flex]}>
            {/* <KeyboardAvoidingView behavior='position' style={flex}> */}
            <ScrollView style={[flex]} contentContainerStyle={{ flex: scrollContentFlex ? 1 : undefined }} >
                {/* {props.title ? <LogoTitleImage title={title} /> : <LogoImage size="mega" style={{ alignSelf: "center" }} noBg />} */}
                <View style={[flex, viewStyle]}>{children}</View>
            </ScrollView>
            {/* </KeyboardAvoidingView> */}
            <Toast {...toastProps} />
            <Dialog ref={prompRef} onDialogDismissed={() => setPromptProps({ visible: false })} visible={promptProps?.visible} containerStyle={[shadow, { backgroundColor: "white", padding: sizes.rem1, borderRadius: sizes.rem1 / 2, borderColor: "#ccc", borderWidth: 1 }]} >
                <Header text={promptProps?._title || ""} />
                <Text style={{ marginBottom: sizes.rem1 }}>{promptProps?._message}</Text>
                <View style={promptProps?._buttons?.length === 2 ? { flexDirection: "row", justifyContent: "space-between" } : { flexDirection: "column" }}>
                    {promptProps?._buttons?.map((b) => {
                        return <Button
                            label={b.text} color={b.textColor} backgroundColor={b.backgroundColor}
                            onPress={() => b.onPress(prompRef.current as IDialog)}
                            style={promptProps._buttons?.length === 2 ? { width: "49%" } : undefined}
                        />
                    })}
                </View>
            </Dialog>
        </SafeAreaView>
    )
}


export const prefixGaurd = new Set<string>();

export let screens = navigationFactory("screens", {
    //LoginScreen: () => LoginScreen,
    // Feed: () => FeedScreen,
    // Notification: () => NotificationScreen,
    // Bookmark: () => BookmarkScreen,
    // App: () => App,
 //   CreateAccount: () => CreateAccountScreen,
    // FeedFilter: () => FeedFilterScreen,
    // Post: () => PostScreen,
    //ImagePicker: () => ImagePickerScreen,
    // ManageSubscriptions: () => ManageSubscriptionsScreen,
    // Profile: () => ProfileScreen,
    // Portfolio: () => PortfolioScreen,
    // Watchlists: () => WatchlistsScreen,
    // Watchlist: () => WatchlistScreen,
    // Competitions: () => CompetitionsScreen,
    // Feedback: () => FeedbackScreen,
    // Search: () => DiscoveryScreen,
    // NewPost: () => NewPostScreen,
    // UpsertWatchlist: () => UpsertWatchlistScreen,
    // Company: () => CompanyScreen,
})

export let parts = navigationFactory("parts", {
    Icon: () => LogoImage,
    SideMenu: () => SideMenu,
    LogoTitle: () => LogoTitleImage,
    MenuButton: () => MenuButton
});


function navigationFactory<T extends Record<string, ComponentProvider>>(prefix: string, components: T) {

    if (prefixGaurd.has(prefix))
        throw new Error(`Prefix:${prefix} has already been registered`);

    type NavigationKey = keyof T;

    Object.keys(components).forEach((k) =>
        Navigation.registerComponent(`${prefix}_${k}`, components[k as NavigationKey]))

    function getComponent(name: NavigationKey, componentSettings?: Omit<LayoutComponent, "name"> & { alignment?: "fill" | "center" }): LayoutComponent & { name: string } {
        return {
            name: `${prefix}_${name}`,
            ...componentSettings
        }
    }
    function getLayout(name: NavigationKey, componentSettings?: Omit<LayoutComponent, "name"> & { alignment?: "fill" | "center" }): Layout {
        return {
            component: getComponent(name, componentSettings)
        }
    }
    function push(componentId: string, name: NavigationKey, componentSettings?: Omit<LayoutComponent, "name"> & { alignment?: "fill" | "center" }) {
        Navigation.push(componentId, getLayout(name, componentSettings))
    }

    return {
        getComponent,
        getLayout,
        push
    }
}