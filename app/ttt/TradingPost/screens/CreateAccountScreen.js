"use strict";
exports.__esModule = true;
exports.screens = void 0;
var react_1 = require("react");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
//import { ScrollView } from 'react-native-gesture-handler';
var components_1 = require("@ui-kitten/components");
var hooks_1 = require("../utils/hooks");
//import { IsAuthenticated, useCurrentUser } from '../apis/Authentication';
var AccountInfoSection_1 = require("./create_account/AccountInfoSection");
var InvestmentInterestSection_1 = require("./create_account/InvestmentInterestSection");
var YourContentSection_1 = require("./create_account/YourContentSection");
//import { IDashboard, IDialog, PromptButton, PromptFunc, BaseScreen } from '../layouts/BaseLayout';
var lds_1 = require("../lds");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var BasicInfoSection_1 = require("./create_account/BasicInfoSection");
var ProfileIconSection_1 = require("./create_account/ProfileIconSection");
var PickWatchlistSection_1 = require("./create_account/PickWatchlistSection");
var Authentication_1 = require("../Authentication");
var AnalystStartSection_1 = require("./create_account/AnalystStartSection");
var LinkBrokerageSection_1 = require("./create_account/LinkBrokerageSection");
var Colors_1 = require("../constants/Colors");
//import { Screen } from './BaseScreen';
exports.screens = {
    'LoginInfo': AccountInfoSection_1.AccountInfoSection,
    //'Verify': () => <View><Text>Verify Your Account</Text></View>,
    'BasicInfo': BasicInfoSection_1.BasicInfoSection,
    'Watchlist': PickWatchlistSection_1.PickWatchlistSection,
    'AnalystStart': AnalystStartSection_1.AnalystStartSection,
    'AnalystInterest': InvestmentInterestSection_1.InvestmentInterestSection,
    'LinkBrokerage': LinkBrokerageSection_1.LinkBrokerageSection,
    'AddClaims': YourContentSection_1.YourContent,
    'ProfilePicture': ProfileIconSection_1.ProfileIconSection //,
    //'Content Accounts': YourContent,
    //'Account Settings': AccountSettings
};
// export function ensureAuthProps(props: CreateAccountProps): props  is AuthAccountProps {
//     return IsAuthenticated(props.user.data)
// }
var screenKeys = Object.keys(exports.screens);
function SubScreen(props) {
    var screenIndex = props.screenIndex, caProps = props.caProps;
    var Screen = exports.screens[screenKeys[screenIndex]];
    /*Hacky based on assumptions*/
    return (screenIndex === 0) ?
        <Screen {...caProps}/> :
        <components_1.Text>Something went very wrong...</components_1.Text>;
}
// function isVerified(authedUser: IAuthenticatedUser | undefined) {
//     return authedUser?.firstName && authedUser?.lastName && authedUser?.status_confirmed;
// }
exports["default"] = (function (props) {
    var appUser = (0, Authentication_1.useAppUser)().appUser, loginResult = (0, lds_1.useData)("loginResult").value, 
    // resolveIdx = useCallback(() => {
    //     return EntityApiBase.token ? 2 : 0
    // }
    // , []),
    //{ verified } = loginResult || {},
    _a = (0, react_1.useState)(0), wizardIndex = _a[0], setWizardIndex = _a[1], user = (0, hooks_1.useReadonlyEntity)(appUser || {
        profile_url: "",
        first_name: "",
        last_name: "",
        handle: "",
        email: "",
        bio: "",
        claims: [],
        display_name: "",
        id: "",
        tags: [],
        subscription: null,
        is_subscribed: false
    }), toast = (0, react_native_toast_notifications_1.useToast)();
    var resolvedIndex = screenKeys.findIndex(function (k) { var _a, _b, _c; return k === ((_c = (_b = (_a = props === null || props === void 0 ? void 0 : props.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.params) === null || _c === void 0 ? void 0 : _c.screen); });
    resolvedIndex = resolvedIndex === -1 ? 2 : resolvedIndex;
    /*
    let resolvedIndex = 0;
    if (wizardIndex < 2 && loginResult) {
        resolvedIndex = 1
        if (appUser)
            resolvedIndex = 2
        //resolvedIndex = 7
    }
    resolvedIndex = Math.max(wizardIndex, resolvedIndex);
    */
    (0, react_1.useLayoutEffect)(function () {
        if (appUser)
            user.resetData(appUser);
    }, [appUser]);
    var caProps = {
        user: user,
        navigation: props.navigation,
        toastMessage: (function (msg, delay) {
            toast.show(msg, {
                duration: delay,
                placement: "top"
            });
        }),
        setWizardIndex: setWizardIndex,
        saveOnly: false
    };
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    return <components_1.TabView style={{
            paddingTop: insets.top / 2,
            backgroundColor: Colors_1.AppColors.background,
            flexGrow: 1,
            maxHeight: "100%"
        }} swipeEnabled={false} selectedIndex={resolvedIndex} indicatorStyle={{
            height: 0
        }} tabBarStyle={{
            height: 0,
            padding: 0,
            paddingBottom: 0,
            paddingTop: 0
        }} shouldLoadComponent={function (index) { return index === resolvedIndex; }}>
        {screenKeys.map(function (v, i) {
            var Screen = exports.screens[screenKeys[i]];
            return <components_1.Tab key={"TAB_" + i}>
                <Screen {...caProps}/>
            </components_1.Tab>;
        })}
        {/* <Tab title='USERS'>
            <Layout style={styles.tabContainer}>
                <Text category='h5'>USERS</Text>
            </Layout>
        </Tab>
        <Tab title='ORDERS'>
            <Layout style={styles.tabContainer}>
                <Text category='h5'>ORDERS</Text>
            </Layout>
        </Tab>
        <Tab title='TRANSACTIONS'>
            <Layout style={styles.tabContainer}>
                <Text category='h5'>TRANSACTIONS</Text>
            </Layout>
        </Tab> */}
    </components_1.TabView>;
});
