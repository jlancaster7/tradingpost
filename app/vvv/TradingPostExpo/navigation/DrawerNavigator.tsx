import { createDrawerNavigator } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute, useNavigationState } from "@react-navigation/native";
import React from "react";
import { Keyboard, Pressable } from "react-native";
import { useAppUser } from "../Authentication";
import { IconButton } from "../components/IconButton";
import { IconifyIcon } from "../components/IconfiyIcon";
import { SideMenu } from "../components/SideMenu";
import { SvgExpo } from "../components/SvgExpo";
import { BookmarkActiveBlue, BookmarkIcons, LogoNoBg } from "../images";
import { sizes } from "../style";
import { useIsKeyboardVisible } from "../utils/hooks";
import { BottomTabNavigator } from "./BottomTabNavigator";
import KeyboardClose from '../assets/@iconify/keyboard-close'

export const Drawer = createDrawerNavigator();


const HeaderTp = () => {
    return <SvgExpo style={{ height: "100%", aspectRatio: 1 }}>
        <LogoNoBg />
    </SvgExpo>
}

export function DrawerPart() {
    const { loginState } = useAppUser();

    console.log("Running Drawer Navigation")
    return loginState?.appUser ? <Drawer.Navigator useLegacyImplementation={true} drawerContent={(props) => <SideMenu  {...props} />}
        screenOptions={({ route, navigation }) => ({
            headerTitleAlign: "center",
            headerTitle: HeaderTp,
            headerRight: (() => {
                const routeName = getFocusedRouteNameFromRoute(route);
                const state = useNavigationState((state) => {
                    return (((state.routes[0]?.state?.routes as any[])?.find(r => r.name === "Feed")?.params as any)?.bookmarkedOnly || "false") as "true" | "false"
                });

                const { isKeyboardVisible } = useIsKeyboardVisible();

                if (isKeyboardVisible) {
                    return <Pressable
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    ><IconifyIcon
                            currentColor="black"
                            icon={KeyboardClose}
                            svgProps={{
                                height: 24,
                                width: 24,
                            }}
                            style={{
                                height: 24,
                                width: 24,
                                marginRight: sizes.rem1
                            }}
                        />
                    </Pressable>
                }

                switch (routeName) {
                    case "Feed":
                        const isMarked = state === "true";
                        return <Pressable onPress={() => {
                            navigation.navigate("Feed", {
                                bookmarkedOnly: isMarked ? "false" : "true"
                            })
                        }}>
                            {!isMarked ? <IconButton
                                iconSource={isMarked ? BookmarkIcons.active : BookmarkIcons.inactive}
                                style={{
                                    height: 28,
                                    width: 28,
                                    marginRight: sizes.rem1
                                }} />
                                : <BookmarkActiveBlue style={{
                                    height: 28,
                                    width: 28,
                                    marginLeft: "auto",
                                    marginRight: (sizes.rem1_5 + sizes.rem1) / 2
                                }} />
                            }
                        </Pressable>
                    default:
                        console.log(routeName);
                        return undefined;
                }
            })
        })}>
        <Drawer.Screen name="Root" component={BottomTabNavigator} />
    </Drawer.Navigator> : null;
}
