import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import { AppTitle } from "../images";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import { sizes } from "../style";
import { DrawerPart } from "./DrawerNavigator";
import { RootStackParamList } from "./pages";

export const Stack = createNativeStackNavigator<RootStackParamList>();
export function RootNavigator() {
  return <Stack.Navigator screenOptions={{
    headerTitle: () => <AppTitle height={"100%"} style={{ marginTop: sizes.rem0_5, height: sizes.rem2, aspectRatio: 5.77 }} />,
    headerTitleAlign: "center",
    headerBackVisible: false
  }}>
    <Stack.Screen name="Root" component={WelcomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Create" component={CreateAccountScreen} options={{ headerShown: false, headerBackVisible: false }} />
    <Stack.Screen name="Dash" component={DrawerPart} options={{ headerShown: false }} />
    <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
  </Stack.Navigator >
}