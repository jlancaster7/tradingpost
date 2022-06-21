/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as React from 'react';

import { ImageBackground, Image, ColorSchemeName, Pressable } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { navIcons } from '../images';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import LoginScreen from '../screens/LoginScreen';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

export default function Navigation({ colorScheme, isLoggedIn }: { colorScheme: ColorSchemeName, isLoggedIn: boolean }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator isLoggedIn={isLoggedIn} />
    </NavigationContainer>
  );
}

type UndefinedProxy<T extends keyof any> = {
  [P in T]: undefined
}

export type PublicPages = UndefinedProxy<"Launch" | "Create" | "Login">

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList & PublicPages>();
function RootNavigator(props: { isLoggedIn: boolean }) {
  return (
    <Stack.Navigator>
      {props.isLoggedIn ? <>
        <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      </> : <>
        <Stack.Screen name="Root" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Create" component={CreateAccountScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </>}
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<any>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return <BottomTab.Navigator
    initialRouteName="TabOne"
    screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme].tint,
    }}>
    {
      Object.keys(navIcons).map((n) => {
        return <BottomTab.Screen
          name={n}
          options={{
            tabBarShowLabel: false,
            lazy: true,
            tabBarIcon: ({ color, focused, size }) => {
              return <ImageBackground source={navIcons[n as keyof typeof navIcons][focused ? "active" : "inactive"]} resizeMode="contain" style={{ height: size, width: size }} />
            }
          }}
          component={TabOneScreen}
        />
      })}
    {/* <BottomTab.Screen
      name="TabOne"
      component={TabOneScreen}
      options={({ navigation }: RootTabScreenProps<'TabOne'>) => ({
        title: 'Tab One',
        tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        headerRight: () => (
          <Pressable
            onPress={() => navigation.navigate('Modal')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}>
            <FontAwesome
              name="info-circle"
              size={25}
              color={Colors[colorScheme].text}
              style={{ marginRight: 15 }}
            />
          </Pressable>
        ),
      })}
    />
    <BottomTab.Screen
      name="TabTwo"
      component={TabTwoScreen}
      options={{
        title: 'Tab Two',
        tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
      }}
    /> */}
  </BottomTab.Navigator>

}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
