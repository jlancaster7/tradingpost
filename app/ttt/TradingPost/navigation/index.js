"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
var vector_icons_1 = require("@expo/vector-icons");
var bottom_tabs_1 = require("@react-navigation/bottom-tabs");
var native_1 = require("@react-navigation/native");
var native_stack_1 = require("@react-navigation/native-stack");
var drawer_1 = require("@react-navigation/drawer");
var SideMenu_1 = require("../components/SideMenu");
var React = require("react");
var react_native_1 = require("react-native");
var Colors_1 = require("../constants/Colors");
var useColorScheme_1 = require("../hooks/useColorScheme");
var images_1 = require("../images");
var CreateAccountScreen_1 = require("../screens/CreateAccountScreen");
var ModalScreen_1 = require("../screens/ModalScreen");
var NotFoundScreen_1 = require("../screens/NotFoundScreen");
var TabOneScreen_1 = require("../screens/TabOneScreen");
var WelcomeScreen_1 = require("../screens/WelcomeScreen");
var LinkingConfiguration_1 = require("./LinkingConfiguration");
var images_2 = require("../images");
var SvgExpo_1 = require("../components/SvgExpo");
var style_1 = require("../style");
var FeedScreen_1 = require("../screens/FeedScreen");
var PortfolioScreen_1 = require("../screens/PortfolioScreen");
var WatchlistEditorScreen_1 = require("../screens/WatchlistEditorScreen");
var WatchlistScreen_1 = require("../screens/WatchlistScreen");
var AuthScreen_1 = require("../screens/AuthScreen");
var ImagePicker_1 = require("../screens/ImagePicker");
var ProfileScreen_1 = require("../screens/ProfileScreen");
var SearchScreen_1 = require("../screens/SearchScreen");
var TableModalScreen_1 = require("../screens/TableModalScreen");
var IconButton_1 = require("../components/IconButton");
var OverlayScreen_1 = require("../screens/OverlayScreen");
var CompanyScreen_1 = require("../screens/CompanyScreen");
var PostEditorScreen_1 = require("../screens/PostEditorScreen");
var NotificationsScreen_1 = require("../screens/NotificationsScreen");
var WatchlistViewerScreen_1 = require("../screens/WatchlistViewerScreen");
var PostScreen_1 = require("../screens/PostScreen");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var Authentication_1 = require("../Authentication");
var SubscriptionScreen_1 = require("../screens/SubscriptionScreen");
function Navigation(_a) {
    var colorScheme = _a.colorScheme;
    return (<react_native_safe_area_context_1.SafeAreaProvider>
            <native_1.NavigationContainer linking={LinkingConfiguration_1["default"]} theme={colorScheme === 'dark' ? native_1.DarkTheme : native_1.DefaultTheme}>
                <RootNavigator />
            </native_1.NavigationContainer>
        </react_native_safe_area_context_1.SafeAreaProvider>);
}
exports["default"] = Navigation;
var Drawer = (0, drawer_1.createDrawerNavigator)();
/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
var Stack = (0, native_stack_1.createNativeStackNavigator)();
var HeaderTp = function () {
    return <SvgExpo_1.SvgExpo style={{ height: "100%", aspectRatio: 1 }}>
        <images_2.LogoNoBg />
    </SvgExpo_1.SvgExpo>;
};
function DrawerPart() {
    var appUser = (0, Authentication_1.useAppUser)().appUser;
    // const linkTo = useLinkTo();
    // useEffect(() => {
    //   if (!appUser) {
    //     Auth.signOut();
    //     linkTo("/login")
    //   }
    // }, [appUser, linkTo])
    return appUser ? <Drawer.Navigator drawerContent={function (props) { return <SideMenu_1.SideMenu appUser={appUser} {...props}/>; }} screenOptions={function (_a) {
            var route = _a.route, navigation = _a.navigation;
            return ({
                headerTitleAlign: "center",
                headerTitle: HeaderTp,
                headerRight: (function () {
                    var routeName = (0, native_1.getFocusedRouteNameFromRoute)(route);
                    switch (routeName) {
                        case "Feed":
                            return function () {
                                var state = (0, native_1.useNavigationState)(function (state) {
                                    var _a, _b, _c, _d;
                                    return (((_d = (_c = (_b = (_a = state.routes[0]) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.routes) === null || _c === void 0 ? void 0 : _c.find(function (r) { return r.name === "Feed"; }).params) === null || _d === void 0 ? void 0 : _d.bookmarkedOnly) || "false");
                                });
                                var isMarked = state === "true";
                                return <react_native_1.Pressable onPress={function () {
                                        navigation.navigate("Feed", {
                                            bookmarkedOnly: isMarked ? "false" : "true"
                                        });
                                    }}>
                                                               {!isMarked ? <IconButton_1.IconButton iconSource={isMarked ? images_1.BookmarkIcons.active : images_1.BookmarkIcons.inactive} style={{
                                            height: 24,
                                            width: 24,
                                            marginRight: style_1.sizes.rem1
                                        }}/>
                                        : <images_1.BookmarkActiveBlue style={{
                                                height: 16,
                                                width: 16,
                                                marginLeft: "auto",
                                                marginRight: (style_1.sizes.rem1_5 + style_1.sizes.rem1) / 2
                                            }}/>}
                                                           </react_native_1.Pressable>;
                            };
                        default:
                            console.log(routeName);
                            return undefined;
                    }
                })()
            });
        }}>
        <Drawer.Screen name="Root" component={BottomTabNavigator} initialParams={{ appUser: appUser }}/>
    </Drawer.Navigator> : null;
}
function RootNavigator() {
    return <Stack.Navigator screenOptions={{
            headerTitle: function () { return <images_1.AppTitle style={{ marginTop: style_1.sizes.rem0_5, height: "100%", aspectRatio: 4 }}/>; },
            headerTitleAlign: "center",
            headerBackVisible: false
        }}>
        <Stack.Screen name="Root" component={WelcomeScreen_1["default"]} options={{ headerShown: false }}/>
        <Stack.Screen name="Create" component={CreateAccountScreen_1["default"]} options={{ headerShown: false, headerBackVisible: false }}/>
        <Stack.Screen name="Dash" component={DrawerPart} options={{ headerShown: false }}/>
        <Stack.Screen name="NotFound" component={NotFoundScreen_1["default"]} options={{ title: 'Oops!' }}/>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="Modal" component={ModalScreen_1["default"]}/>
            <Stack.Screen name="Subscription" component={SubscriptionScreen_1.SubscriptionScreen}/>
            <Stack.Screen name="SubscriptionSettings" component={SubscriptionScreen_1.SubscriptionSettingsScreen}/>
            <Stack.Screen name="WatchlistEditor" component={WatchlistEditorScreen_1.WatchlistEditorScreen}/>
            <Stack.Screen name="PostScreen" component={PostScreen_1.PostScreen}/>
            <Stack.Screen name="PostEditor" component={PostEditorScreen_1.PostEditorScreen}/>
            <Stack.Screen name="WatchlistViewer" component={WatchlistViewerScreen_1.WatchlistViewerScreen}/>
            <Stack.Screen name="Watchlist" component={WatchlistScreen_1.WatchlistScreen}/>
            <Stack.Screen name="Auth" component={AuthScreen_1.AuthScreen}/>
            <Stack.Screen name="ImagePicker" component={ImagePicker_1.ImagePickerScreen}/>
            <Stack.Screen name="Company" component={CompanyScreen_1.CompanyScreen}/>
            <Stack.Screen name="TableModal" component={TableModalScreen_1.TableModalScreen}/>
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
        }} component={OverlayScreen_1.OverlayScreen}/>
        </Stack.Group>
        <Stack.Group screenOptions={{
            presentation: "modal",
            headerStyle: {
                backgroundColor: "transparent"
            },
            headerTintColor: "white",
            headerBackground: function () { return <react_native_1.View></react_native_1.View>; },
            headerTitle: "",
            contentStyle: {
                marginTop: -64
            }
        }}>
            <Stack.Screen name="Profile" component={ProfileScreen_1.ProfileScreen}/>
        </Stack.Group>
    </Stack.Navigator>;
}
/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
var BottomTab = (0, bottom_tabs_1.createBottomTabNavigator)();
var DashComponents = {
    Portfolio: {
        c: PortfolioScreen_1.PortfolioScreen
    },
    Feed: {
        c: FeedScreen_1.FeedScreen
    },
    Search: {
        c: SearchScreen_1.SearchScreen
    },
    Notification: {
        c: NotificationsScreen_1.NotificationsScreen
    }
};
function BottomTabNavigator(props) {
    var colorScheme = (0, useColorScheme_1["default"])();
    var appUser = props.appUser;
    return <BottomTab.Navigator initialRouteName="Feed" screenOptions={{
            tabBarActiveTintColor: Colors_1["default"][colorScheme].tint,
            headerShown: false
        }}>
        {Object.keys(images_1.navIcons).map(function (n) {
            var _a, _b;
            return <BottomTab.Screen key={n} name={n} options={function (_a) {
                    var navigation = _a.navigation, route = _a.route;
                    return ({
                        //TODO: this makes things a bit choppy .. shoudl change in the future
                        unmountOnBlur: true,
                        tabBarShowLabel: false,
                        lazy: true,
                        tabBarIcon: function (_a) {
                            var color = _a.color, focused = _a.focused, size = _a.size;
                            return <react_native_1.ImageBackground source={images_1.navIcons[n][focused ? "active" : "inactive"]} resizeMode="contain" style={{ height: size, width: size }}/>;
                        }
                    });
                }} component={((_a = DashComponents[n]) === null || _a === void 0 ? void 0 : _a.c) || TabOneScreen_1["default"]} initialParams={__assign({ appUser: appUser }, (_b = DashComponents[n]) === null || _b === void 0 ? void 0 : _b.p)}/>;
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
    </BottomTab.Navigator>;
}
/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props) {
    return <vector_icons_1.FontAwesome size={30} style={{ marginBottom: -3 }} {...props}/>;
}
