/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {FontAwesome} from '@expo/vector-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
    getFocusedRouteNameFromRoute,
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
    useNavigation,
    useLinkTo,
    NavigationProp,
    useNavigationState
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {createDrawerNavigator} from '@react-navigation/drawer';
import {SideMenu} from '../components/SideMenu';

import * as React from 'react';
import {useEffect} from 'react';

import {Text, ImageBackground, Image, ColorSchemeName, Pressable, View} from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import {AppTitle, BookmarkActive, BookmarkActiveBlue, BookmarkIcons, Logo, navIcons} from '../images';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import LoginScreen from '../screens/LoginScreen';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import {RootStackParamList, RootTabParamList, RootTabScreenProps} from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import {LogoNoBg} from '../images'
import {SvgExpo} from '../components/SvgExpo';
import Auth from '@tradingpost/common/api/entities/static/AuthApi';
import { IUserGet } from '@tradingpost/common/api/entities/interfaces';
import { sizes } from '../style';
import { FeedScreen } from '../screens/FeedScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { WatchlistEditorScreen } from '../screens/WatchlistEditorScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ImagePickerScreen } from '../screens/ImagePicker';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { TableModalScreen } from '../screens/TableModalScreen';
import { IconButton } from '../components/IconButton';
import { OverlayScreen } from '../screens/OverlayScreen';
import { CompanyScreen } from '../screens/CompanyScreen';
import { PostEditorScreen } from '../screens/PostEditorScreen';
import { WatchlistViewerScreen } from '../screens/WatchlistViewerScreen';
import { PostScreen } from '../screens/PostScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppUser } from '../Authentication';
import { SubscriptionScreen, SubscriptionSettingsScreen } from '../screens/SubscriptionScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { VerificationScreen } from '../screens/VerificationScreen';


export default function Navigation({colorScheme}: { colorScheme: ColorSchemeName }) {
    return (
        <SafeAreaProvider>
            <NavigationContainer
                linking={LinkingConfiguration}
                theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <RootNavigator/>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

type UndefinedProxy<T extends keyof any> = {
    [P in T]: undefined
}

// TODO: these defined the parameters... so should type these correctly .. I will do that in the future
export type AllPages = UndefinedProxy<"Launch" | "Create" | "Login" | "Dash" | "WatchlistViewer" | "WatchlistEditor" | "Watchlist" | "Auth" | "ImagePicker"> & {
  "Company": Parameters<(typeof CompanyScreen)>["0"]["route"]["params"],
  "Bookmarks": Parameters<(typeof FeedScreen)>["0"]["route"]["params"],
  "TableModal": Parameters<(typeof TableModalScreen)>["0"]["route"]["params"],
  "OverlayModal": undefined,
  "PostEditor": undefined,
  "PostScreen": Parameters<(typeof PostScreen)>["0"]["route"]["params"],
  "Profile": Parameters<(typeof ProfileScreen)>["0"]["route"]["params"],
  "Subscription": undefined,
  "SubscriptionSettings": undefined,
  "VerifyAccount": undefined,
  "ResetPassword": undefined
}

const Drawer = createDrawerNavigator();

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList & AllPages>();

const HeaderTp = () => {
    return <SvgExpo style={{height: "100%", aspectRatio: 1}}>
        <LogoNoBg/>
    </SvgExpo>
}

export type DashScreenProps<T = never> = {
  appUser: IUserGet,
  navigation: NavigationProp<any>
  route: T extends never ? undefined : {
    params: T
  }
}

export type TabScreenProps<T = never> = DashScreenProps<T> & {
  navigation: NavigationProp<AllPages>
}

function DrawerPart() {
    const {appUser} = useAppUser();

    // const linkTo = useLinkTo();

    // useEffect(() => {
    //   if (!appUser) {
    //     Auth.signOut();
    //     linkTo("/login")
    //   }
    // }, [appUser, linkTo])

  return appUser ? <Drawer.Navigator drawerContent={(props) => <SideMenu appUser={appUser} {...props} />}
    screenOptions={({ route, navigation }) => ({
      headerTitleAlign: "center",
      headerTitle: HeaderTp,
      headerRight: (() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        switch (routeName) {
          case "Feed":
            return () => {
              const state = useNavigationState((state) => {
                return (((state.routes[0]?.state?.routes as any[])?.find(r => r.name === "Feed").params as any)?.bookmarkedOnly || "false") as "true" | "false"
              });
              const isMarked = state === "true";
              return <Pressable onPress={() => {
                navigation.navigate("Feed", {
                  bookmarkedOnly: isMarked ? "false" : "true"
                })
              }}>
                {!isMarked ? <IconButton
                  iconSource={isMarked ? BookmarkIcons.active : BookmarkIcons.inactive}
                  style={{
                    height: 24,
                    width: 24,
                    marginRight: sizes.rem1
                  }} />
                  : <BookmarkActiveBlue style={{
                    height: 16,
                    width: 16,
                    marginLeft: "auto",
                    marginRight: (sizes.rem1_5 + sizes.rem1) / 2
                  }} />
                }
              </Pressable>
            }
          default:
            console.log(routeName);
            return undefined;
        }
      })()
    })}>
    <Drawer.Screen name="Root" component={BottomTabNavigator} initialParams={{ appUser }} />
  </Drawer.Navigator> : null;
}

function RootNavigator() {
  return <Stack.Navigator screenOptions={{
    headerTitle: () => <AppTitle height={"100%"} style={{ marginTop: sizes.rem0_5, height: sizes.rem2, aspectRatio: 5.77 }} />,

    headerTitleAlign: "center", headerBackVisible: false
  }}>
    <Stack.Screen name="Root" component={WelcomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Create" component={CreateAccountScreen} options={{ headerShown: false, headerBackVisible: false }} />
    <Stack.Screen name="Dash" component={DrawerPart} options={{ headerShown: false }} />
    <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="Modal" component={ModalScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="ResetPassword" component={ChangePasswordScreen} />
      <Stack.Screen name="VerifyAccount" component={VerificationScreen} />
      <Stack.Screen name="SubscriptionSettings" component={SubscriptionSettingsScreen} />
      <Stack.Screen name="WatchlistEditor" component={WatchlistEditorScreen} />
      <Stack.Screen name="PostScreen" component={PostScreen} />
      <Stack.Screen name="PostEditor" component={PostEditorScreen} />
      <Stack.Screen name="WatchlistViewer" component={WatchlistViewerScreen} />
      <Stack.Screen name="Watchlist" component={WatchlistScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="ImagePicker" component={ImagePickerScreen} />
      <Stack.Screen name="Company" component={CompanyScreen} />
      <Stack.Screen name="TableModal" component={TableModalScreen} />
      <Stack.Screen name="OverlayModal" options={{
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
    </Stack.Group>
    <Stack.Group screenOptions={{
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
        <Stack.Screen name="Root" component={WelcomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Create" component={CreateAccountScreen}
                      options={{headerShown: false, headerBackVisible: false}}/>
        <Stack.Screen name="Dash" component={DrawerPart} options={{headerShown: false}}/>
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{title: 'Oops!'}}/>
        <Stack.Group screenOptions={{presentation: 'modal'}}>
            <Stack.Screen name="Modal" component={ModalScreen}/>
            <Stack.Screen name="Subscription" component={SubscriptionScreen}/>
            <Stack.Screen name="SubscriptionSettings" component={SubscriptionSettingsScreen}/>
            <Stack.Screen name="WatchlistEditor" component={WatchlistEditorScreen}/>
            <Stack.Screen name="PostScreen" component={PostScreen}/>
            <Stack.Screen name="PostEditor" component={PostEditorScreen}/>
            <Stack.Screen name="WatchlistViewer" component={WatchlistViewerScreen}/>
            <Stack.Screen name="Watchlist" component={WatchlistScreen}/>
            <Stack.Screen name="Auth" component={AuthScreen}/>
            <Stack.Screen name="ImagePicker" component={ImagePickerScreen}/>
            <Stack.Screen name="Company" component={CompanyScreen}/>
            <Stack.Screen name="TableModal" component={TableModalScreen}/>
            <Stack.Screen name="OverlayModal" options={{
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
            }} component={OverlayScreen}/>
            <Stack.Screen name="NotificationTrade" component={NotificationTradeScreen}/>
        </Stack.Group>
        <Stack.Group screenOptions={{
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
            <Stack.Screen name="Profile" component={ProfileScreen}/>
        </Stack.Group>
    </Stack.Navigator>
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<any>();


const DashComponents: Partial<Record<keyof typeof navIcons, { c: React.ComponentType<any>, p?: any, headerRight?: (props: { navigation: NavigationProp<any>, route: any }) => React.ReactNode }>> = {
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

function BottomTabNavigator(props: { appUser: IUserGet }) {
    const colorScheme = useColorScheme();
    const {appUser} = props;
    return <BottomTab.Navigator
        initialRouteName="Feed"
        screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme].tint,
            headerShown: false
        }}>
        {
            Object.keys(navIcons).map((n) => {
                return <BottomTab.Screen
                    key={n}
                    name={n}
                    options={({navigation, route}) => ({
                        //TODO: this makes things a bit choppy .. shoudl change in the future
                        unmountOnBlur: true,
                        tabBarShowLabel: false,
                        lazy: true,
                        tabBarIcon: ({color, focused, size}) => {
                            return <ImageBackground
                                source={navIcons[n as keyof typeof navIcons][focused ? "active" : "inactive"]}
                                resizeMode="contain" style={{height: size, width: size}}/>
                        },
                        // headerRight: (() => {
                        //   const hr = DashComponents[n as keyof typeof navIcons]?.headerRight;
                        //   return hr ? () => hr({
                        //     navigation,
                        //     route
                        //   }) : undefined
                        // })(),
                        //headerShown: Boolean(DashComponents[n as keyof typeof navIcons]?.headerRight)
                    })}
                    component={DashComponents[n as keyof typeof navIcons]?.c || TabOneScreen}
                    initialParams={{appUser, ...DashComponents[n as keyof typeof navIcons]?.p}}
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
    return <FontAwesome size={30} style={{marginBottom: -3}} {...props} />;
}





