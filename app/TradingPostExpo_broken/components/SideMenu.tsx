import React, { ReactChild, useLayoutEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native-ui-lib";
import { Image } from "react-native";
//import { ensureCurrentUser, signOut, useCurrentUser } from "../apis/Authentication";
import { LogoImage } from "./LogoImage";
import { font, fonts, rounded, sizes } from "../style";
import { Link } from "./Link";
import { SetPublicLayout, screens } from "../layouts/BaseLayout";
import { SvgProps } from "react-native-svg";
import { sideMenu } from "../images";
//import { parts, screens } from "../navigationComponents";
import { Navigation } from "react-native-navigation";
//import { DashProps, fullDashOptions } from "../layouts/DashboardLayout";
import { TBI } from "../utils/misc";
import Clipboard from '@react-native-clipboard/clipboard'
//import { openProfileScreen } from "../screens/ProfileScreen";
import { useData } from "../lds";

const padSmall = { marginBottom: sizes.rem1 / 8 };

export function SideMenu(props: { componentId: string }) {
    const { value: currentUser } = useData("currentUser");
    const { value: loginResult } = useData("loginResult");
    const [activeTabIndex, setActiveTab] = useState(2);

    useLayoutEffect(() => {
        const sub1 = Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex, unselectedTabIndex }) => {
            setActiveTab(selectedTabIndex);
        })
        return () => sub1.remove();
    }, [])

    const activeTabId = `BottomTabs_${activeTabIndex}`

    return <View backgroundColor="white" style={{ flexGrow: 1 }}>
        <View backgroundColor="transparent" style={{ alignSelf: "center", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => screens.push(activeTabId, "CreateAccount", {
                    //                options: fullDashOptions,
                    passProps: { asProfile: true }
                })}>
                <Image
                    source={{ uri: "" }}
                    style={[rounded(80), { marginTop: sizes.rem1 }, padSmall]}
                />
                <Text style={[font("xSmall", "black", true), padSmall]} >@{currentUser.handle}</Text>
                <Text style={[font("medium", "black", true), padSmall]} >{currentUser.display_name}</Text>
            </TouchableOpacity>
            <Text style={[font("xSmall", "darkgray", true), padSmall]} >subscribers: TBD</Text>
            <Link style={{ fontSize: fonts.xSmall, fontWeight: "bold" }}
                // onPress={() =>
                //      screens.push(activeTabId, "ManageSubscriptions", {
                //     options: fullDashOptions,
                //     passProps: { isFullscreen: true } as DashProps
                // })}
            >Manage Subscriptions</Link>
        </View>
        <MenuItem
            // onPress={() => openProfileScreen(activeTabId, currentUser.id)}
            icon={sideMenu.Profile}>Profile</MenuItem>
        <MenuItem
            onPress={() => screens.push(activeTabId, "CreateAccount", {
            //    options: fullDashOptions,
                passProps: { asProfile: true, isFullscreen: true }
            })}
            icon={sideMenu.Account}>Account</MenuItem>
        {/* <MenuItem
            onPress={() => screens.push(activeTabId, "Watchlists", {
                options: fullDashOptions,
                passProps: { isFullscreen: true }
            })}
            icon={sideMenu.Account}>Watchlists</MenuItem>
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
        <MenuItem
            onPress={() => TBI()// signOut()
            }
            icon={sideMenu.LogOut}>Logout</MenuItem>
        <MenuItem
            onPress={() => {
                //Clipboard.setString(log);
            }}
            icon={sideMenu.LogOut}>Token</MenuItem>
    </View>
}

function MenuItem(props: { children?: ReactChild, icon: React.FC<SvgProps>, onPress?: () => void }) {
    const { icon: SvgElement } = props
    return <TouchableOpacity
        onPress={props.onPress || TBI}
        style={{ flexDirection: "row", margin: sizes.rem1, marginTop: 8, alignItems: "center" }}>
        <SvgElement height={24} width={24} />
        <Text style={{ fontSize: fonts.small, marginLeft: 16 }}>{props.children}</Text>
    </TouchableOpacity>
}