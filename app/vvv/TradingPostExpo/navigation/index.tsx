/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  NavigationProp,
  useNavigationState
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { SideMenu } from '../components/SideMenu';

import * as React from 'react';

import { ColorSchemeName } from 'react-native';
//import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './RootNavigator';

export default function Navigation({ colorScheme, whenReady }: { colorScheme: ColorSchemeName, whenReady: () => void }) {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        onReady={() => {
          whenReady();
        }}
        linking={LinkingConfiguration}
        theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      ><RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

{/* <Stack.Screen name="OverlayModal" options={{
        presentation: "transparentModal",
        headerStyle: {
          backgroundColor: "transparent"
        },
        headerTintColor: "white",
        headerShown: false,
        // headerBackground: () => <View></View>,
        headerTitle: "",
        contentStyle: {
          //marginTop: -64
        }
      }} component={OverlayScreen} />
       */}