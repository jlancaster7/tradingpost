import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ImageBackground, ImageSourcePropType } from "react-native";
import { NavIconKeys, navIcons, NavIconTypeOverride } from "../images";
import { FeedScreen } from "../screens/FeedScreen";
import { NotificationScreen } from "../screens/NotificationScreen";
import { PortfolioScreen } from "../screens/PortfolioScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { Api } from "@tradingpost/common/api";
import { useAppUser } from "../Authentication";
import { registerDeviceForNotifications } from "../utils/notifications";

const BottomTab = createBottomTabNavigator<any>();
const DashComponents: Record<keyof typeof navIcons, { c: React.ComponentType<any>, p?: any, headerRight?: (props: { navigation: NavigationProp<any>, route: any }) => React.ReactNode }> = {
    Portfolio: {
        c: PortfolioScreen
    },
    Feed: {
        c: FeedScreen
    },
    Search: {
        c: SearchScreen,
    },
    Notification: {
        c: NotificationScreen,
    }
}

export function BottomTabNavigator() {
    const [hasNotifications, setHasNotifications] = useState(false);
    useEffect(() => {
        const t = async () => {
            const notificationCount = await Api.Notification.extensions.hasNotifications();
            setHasNotifications(notificationCount.unseenCount > 0);
        }

        t();
        //We should just use the notification networks... either a notification is received when the app is open...
        // or when the app opens it checks for notifications 

        const interval = setInterval(async () => {
            const notificationCount = await Api.Notification.extensions.hasNotifications();
            setHasNotifications(notificationCount.unseenCount > 0);
        }, 5000);

        return () => {
            clearInterval(interval)
        }
    }, []);

    const { loginState } = useAppUser();
    useEffect(() => {
        console.log("STARTING TO Registering User");
        if (loginState?.appUser) {
            console.log("Registering User");
            setTimeout(() => {
                registerDeviceForNotifications()
            }, 2000)
        }
    }, [loginState?.appUser]);


    return <BottomTab.Navigator
        initialRouteName="Feed"
        screenOptions={{
            //tabBarActiveTintColor: Colors[colorScheme].tint,
            headerShown: false
        }}>
        {Object.keys(navIcons).map((n) =>
            <BottomTab.Screen
                key={n}
                name={n}
                options={({ navigation, route }) => ({
                    //TODO: this makes things a bit choppy .. shoudl change in the future
                    unmountOnBlur: true,
                    tabBarShowLabel: false,
                    lazy: true,
                    tabBarIcon: ({ color, focused, size }) => {
                        const activeType = focused ? "active" : "inactive";
                        let navIcon: ImageSourcePropType = navIcons[n as keyof typeof navIcons][activeType];
                        if (NavIconTypeOverride[n as keyof typeof navIcons]) {
                            if (hasNotifications) {
                                navIcon = NavIconTypeOverride[n as keyof typeof navIcons]["has"][activeType];
                            }
                        }

                        return <ImageBackground
                            source={navIcon}
                            resizeMode="contain" style={{ height: size, width: size }} />
                    },
                })}
                component={DashComponents[n as keyof typeof navIcons].c}
                initialParams={{ ...DashComponents[n as keyof typeof navIcons]?.p }}
            />)}
    </BottomTab.Navigator>
}
