import React, { ReactChild, useLayoutEffect, useState } from "react";
import { Text } from "@ui-kitten/components";
import { View, Image, Pressable } from "react-native";
//import { ensureCurrentUser, signOut, useCurrentUser } from "../apis/Authentication";
import { LogoImage } from "./LogoImage";
import { font, fonts, rounded, sizes } from "../style";
import { Link } from "./Link";
//import { SetPublicLayout, screens } from "../layouts/BaseLayout";
import { SvgProps } from "react-native-svg";
import { sideMenu } from "../images";
//import { parts, screens } from "../navigationComponents";
//import { Navigation } from "react-native-navigation";
//import { DashProps, fullDashOptions } from "../layouts/DashboardLayout";
import { TBI } from "../utils/misc";
//import Clipboard from '@react-native-clipboard/clipboard'
//import { openProfileScreen } from "../screens/ProfileScreen";
import { useData } from "../lds";
import { SvgExpo } from "./SvgExpo";
//import { useEnsureUser } from "./EnsureUser";
import { useRef } from "react";
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { useAppUser } from '../Authentication';
import { NavigationProp } from "@react-navigation/native";
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { DashScreenProps } from "../navigation";
import { ProfileButton } from "./ProfileButton";
import { useLinkTo } from "@react-navigation/native";

const padSmall = { marginBottom: sizes.rem1 / 8 };

export function SideMenu(props: DrawerContentComponentProps & DashScreenProps) {
    //const { value: currentUser } = useData("currentUser");
    //const { value: loginResult } = useData("loginResult");
    const [activeTabIndex, setActiveTab] = useState(2);

    // useLayoutEffect(() => {
    //     const sub1 = Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex, unselectedTabIndex }) => {
    //         setActiveTab(selectedTabIndex);
    //     })
    //     return () => sub1.remove();
    // }, [])
    const { setValue: setHasAuthed } = useData("hasAuthed");
    const activeTabId = `BottomTabs_${activeTabIndex}`
    const { signOut } = useAppUser();
    const linkTo = useLinkTo<any>();
    //Not sure if the issue here but this seems to work for now.
    //const { EnsureUser, appUser, signOut } = useEnsureUser(props.navigation as any as NavigationProp<any>);
    const currentUser = props.appUser;
    return <DrawerContentScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flexGrow: 1, backgroundColor: "white" }}>
        <View style={{ alignSelf: "center", alignItems: "center", backgroundColor: "transparent" }}>
            <Pressable
                style={{ alignItems: "center" }}
            // onPress={() => screens.push(activeTabId, "CreateAccount", {
            //     //                options: fullDashOptions,
            //     passProps: { asProfile: true }
            // })}

            >
                <View
                    style={[{ marginTop: sizes.rem1 }, padSmall]}
                >
                    <ProfileButton size={80} profileUrl={currentUser.profile_url || ""} userId={currentUser.id} />
                </View>
                <Text style={[font("xSmall", "black", true), padSmall]} >@{currentUser.handle}</Text>
                <Text style={[font("medium", "black", true), padSmall]} >{currentUser.display_name}</Text>
            </Pressable>
            <Text style={[font("xSmall", "darkgray", true), padSmall]} >Subscribers: {currentUser.subscription?.count}</Text>
            <Link onPress={() => {
                
                props.navigation.navigate("Subscription");

            }} style={{ fontSize: fonts.xSmall, fontWeight: "bold" }}
            // onPress={() =>
            //      screens.push(activeTabId, "ManageSubscriptions", {
            //     options: fullDashOptions,
            //     passProps: { isFullscreen: true } as DashProps
            // })}
            >Manage Subscriptions</Link>
        </View>
        {([{
            label: "Profile",
            onPress: () => props.navigation.navigate("Profile", {
                userId: currentUser.id
            }),
            icon: sideMenu.Profile
        },
        {
            label: "Account",
            //onPress: () => props.navigation.navigate("Create"),
            onPress: () => props.navigation.navigate("AccountInformation"),
            icon: sideMenu.Account,
        },
        {
            label: "Watchlists",
            onPress: () => props.navigation.navigate("Watchlist"),
            //onPress: () => linkTo('/create/watchlist'),
            icon: sideMenu.Watchlist,
        },
        {
            label: "Bookmarks",
            onPress: () => props.navigation.navigate("Feed", {
                bookmarkedOnly: "true"
            }),
            icon: sideMenu.BookmarkActiveBlue,
        },
        {
            label: "Help",
            onPress: () => props.navigation.navigate("Help"),

            icon: sideMenu.Help,
        },
        {
            label: "Logout",
            onPress: () => {
                setHasAuthed(false);
                signOut()
                linkTo('/login') //TODO: this was an attempt to fix the logout going to blank screen, didn't work, but reminder
            },
            icon: sideMenu.LogOut
        }] as { onPress?: () => void, label: string, icon: React.FC<SvgProps> }[]).map((item, index, array) => {
            return <MenuItem
                key={"SM_" + index}
                icon={item.icon}
                size={"10%"}
                onPress={item.onPress || TBI}
                navigation={props.navigation}
                isLast={index === array.length - 1}
            >{item.label}</MenuItem>
        })}
        {/* <MenuItem
            onPress={() => props.navigation.navigate("Watchlist")}
            icon={sideMenu.Watchlist}>Watchlists</MenuItem> */}
        {/*
        <MenuItem
            onPress={() => screens.push(activeTabId, "Feedback", {
                options: fullDashOptions,
                passProps: { isFullscreen: true }
            })}
            icon={sideMenu.Feedback}>Feedback</MenuItem>
        <MenuItem
            onPress={() => screens.push(activeTabId, "Competitions", {
                options: fullDashOptions,
                passProps: { isFullscreen: true }
            })}
            icon={sideMenu.Competition}>Competitions</MenuItem>
        <MenuItem
            icon={sideMenu.Help}>Help</MenuItem> */}

        {/* <MenuItem
                onPress={() => {
                    //Clipboard.setString(log);
                }}
                icon={sideMenu.LogOut}>Token</MenuItem> */}
    </DrawerContentScrollView>
}

function MenuItem(props: { navigation: DrawerContentComponentProps["navigation"], children: string, icon: React.FC<SvgProps>, onPress?: () => void, isLast?: boolean, size?: string | number }) {
    const { icon: SvgElement } = props
    return <DrawerItem
        style={props.isLast ? { marginTop: "auto" } : undefined}
        label={props.children}
        icon={(props) => <SvgExpo height={props.size} width={props.size} style={{ height: props.size, width: props.size }}>
            <SvgElement />
        </SvgExpo>}
        onPress={() => {
            props.onPress?.call(undefined);
            props.navigation.closeDrawer();
        }
        }
        labelStyle={{ marginLeft: -16, }}

    />
    /* <Text style={{ fontSize: fonts.small, marginLeft: 16 }}>{}</Text> */
}