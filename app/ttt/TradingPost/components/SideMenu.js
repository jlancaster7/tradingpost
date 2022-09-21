"use strict";
exports.__esModule = true;
exports.SideMenu = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
var react_native_1 = require("react-native");
var style_1 = require("../style");
var Link_1 = require("./Link");
var images_1 = require("../images");
//import { parts, screens } from "../navigationComponents";
//import { Navigation } from "react-native-navigation";
//import { DashProps, fullDashOptions } from "../layouts/DashboardLayout";
var misc_1 = require("../utils/misc");
//import Clipboard from '@react-native-clipboard/clipboard'
//import { openProfileScreen } from "../screens/ProfileScreen";
var lds_1 = require("../lds");
var SvgExpo_1 = require("./SvgExpo");
var Authentication_1 = require("../Authentication");
var drawer_1 = require("@react-navigation/drawer");
var ProfileButton_1 = require("./ProfileButton");
var native_1 = require("@react-navigation/native");
var padSmall = { marginBottom: style_1.sizes.rem1 / 8 };
function SideMenu(props) {
    //const { value: currentUser } = useData("currentUser");
    //const { value: loginResult } = useData("loginResult");
    var _a = (0, react_1.useState)(2), activeTabIndex = _a[0], setActiveTab = _a[1];
    // useLayoutEffect(() => {
    //     const sub1 = Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex, unselectedTabIndex }) => {
    //         setActiveTab(selectedTabIndex);
    //     })
    //     return () => sub1.remove();
    // }, [])
    var setHasAuthed = (0, lds_1.useData)("hasAuthed").setValue;
    var activeTabId = "BottomTabs_".concat(activeTabIndex);
    var signOut = (0, Authentication_1.useAppUser)().signOut;
    var linkTo = (0, native_1.useLinkTo)();
    //Not sure if the issue here but this seems to work for now.
    //const { EnsureUser, appUser, signOut } = useEnsureUser(props.navigation as any as NavigationProp<any>);
    var currentUser = props.appUser;
    return <drawer_1.DrawerContentScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flexGrow: 1, backgroundColor: "white" }}>
        <react_native_1.View style={{ alignSelf: "center", alignItems: "center", backgroundColor: "transparent" }}>
            <react_native_1.Pressable style={{ alignItems: "center" }}>
                <react_native_1.View style={[{ marginTop: style_1.sizes.rem1 }, padSmall]}>
                    <ProfileButton_1.ProfileButton size={80} profileUrl={currentUser.profile_url || ""} userId={currentUser.id}/>
                </react_native_1.View>
                <components_1.Text style={[(0, style_1.font)("xSmall", "black", true), padSmall]}>@{currentUser.handle}</components_1.Text>
                <components_1.Text style={[(0, style_1.font)("medium", "black", true), padSmall]}>{currentUser.display_name}</components_1.Text>
            </react_native_1.Pressable>
            <components_1.Text style={[(0, style_1.font)("xSmall", "darkgray", true), padSmall]}>subscribers: TBD</components_1.Text>
            <Link_1.Link onPress={function () {
            props.navigation.navigate("Subscription");
        }} style={{ fontSize: style_1.fonts.xSmall, fontWeight: "bold" }}>Manage Subscriptions</Link_1.Link>
        </react_native_1.View>
        {[{
                label: "Profile",
                onPress: function () { return props.navigation.navigate("Profile", {
                    userId: currentUser.id
                }); },
                icon: images_1.sideMenu.Profile
            },
            {
                label: "Account",
                //onPress: () => props.navigation.navigate("Create"),
                onPress: function () { return linkTo('/create/watchlist'); },
                icon: images_1.sideMenu.Account
            },
            {
                label: "Watchlist",
                onPress: function () { return props.navigation.navigate("Watchlist"); },
                //onPress: () => linkTo('/create/watchlist'),
                icon: images_1.sideMenu.Account
            },
            {
                label: "Bookmarks",
                onPress: function () { return props.navigation.navigate("Feed", {
                    bookmarkedOnly: "true"
                }); },
                icon: images_1.sideMenu.BookmarkActiveBlue
            },
            {
                label: "Logout",
                onPress: function () {
                    setHasAuthed(false);
                    signOut();
                },
                icon: images_1.sideMenu.LogOut
            }].map(function (item, index, array) {
            return <MenuItem key={"SM_" + index} icon={item.icon} onPress={item.onPress || misc_1.TBI} navigation={props.navigation} isLast={index === array.length - 1}>{item.label}</MenuItem>;
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
    </drawer_1.DrawerContentScrollView>;
}
exports.SideMenu = SideMenu;
function MenuItem(props) {
    var SvgElement = props.icon;
    return <drawer_1.DrawerItem style={props.isLast ? { marginTop: "auto" } : undefined} label={props.children} icon={function (props) { return <SvgExpo_1.SvgExpo style={{ height: props.size, width: props.size }}>
            <SvgElement />
        </SvgExpo_1.SvgExpo>; }} onPress={function () {
            var _a;
            (_a = props.onPress) === null || _a === void 0 ? void 0 : _a.call(undefined);
            props.navigation.closeDrawer();
        }} labelStyle={{ marginLeft: -16 }}/>;
    /* <Text style={{ fontSize: fonts.small, marginLeft: 16 }}>{}</Text> */
}
