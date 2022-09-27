import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationProp } from "@react-navigation/native";
import React from "react";
import { ImageBackground, useColorScheme } from "react-native";
import Colors from '../constants/Colors';
import { navIcons } from "../images";
import { FeedScreen } from "../screens/FeedScreen";
import { NotificationScreen } from "../screens/NotificationScreen";
import { PortfolioScreen } from "../screens/PortfolioScreen";
import { SearchScreen } from "../screens/SearchScreen";

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
    const colorScheme = useColorScheme();
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
                        return <ImageBackground
                            source={navIcons[n as keyof typeof navIcons][focused ? "active" : "inactive"]}
                            resizeMode="contain" style={{ height: size, width: size }} />
                    },
                })}
                component={DashComponents[n as keyof typeof navIcons].c}
                initialParams={{ ...DashComponents[n as keyof typeof navIcons]?.p }}
            />)}
    </BottomTab.Navigator>
}
