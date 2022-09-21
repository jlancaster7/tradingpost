"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.ProfileScreen = void 0;
var react_1 = require("react");
var api_1 = require("@tradingpost/common/api");
var components_1 = require("@ui-kitten/components");
//import { ensureCurrentUser } from "../apis/Authentication";
var ProfileBanner_1 = require("../components/ProfileBanner");
//import { IAmiraUser } from "../interfaces/IUser";
//import { DashboardScreen, DashProps, fullDashOptions, IDashboard } from "../layouts/DashboardLayout";
//import { } from 'react-native-linear-gradient'
var style_1 = require("../style");
var react_native_1 = require("react-native");
var misc_1 = require("../utils/misc");
var SecondaryButton_1 = require("../components/SecondaryButton");
var Section_1 = require("../components/Section");
//import { PostList, usePostLoader } from "../components/PostList";
//import { getCompetitionsPast } from "../apis/CompetitionApi";
var Table_1 = require("../components/Table");
var WatchlistSection_1 = require("../components/WatchlistSection");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var FeedScreen_1 = require("./FeedScreen");
var Colors_1 = require("../constants/Colors");
var WatchlistViewerScreen_1 = require("./WatchlistViewerScreen");
var PrimaryChip_1 = require("../components/PrimaryChip");
var Authentication_1 = require("../Authentication");
var InteractiveGraph_1 = require("../components/InteractiveGraph");
var ButtonGroup_1 = require("../components/ButtonGroup");
//import { screens } from "../navigationComponents";
//import { getUser } from "../apis/UserApi";
//May need to be changed for ios
var TabPanelSize = 48;
var StatusBarsize = 20;
var ButtonMargin = 8;
var ButtonBarsize = 43;
var titles = 27 + 17;
var tabBarMargin = style_1.sizes.rem1;
var clampBuffer = 4;
var collapseShift = 2 * ButtonMargin;
function ProfileScreen(props) {
    var _this = this;
    var _a, _b, _c, _d, _e;
    var userId = (_b = (_a = props.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.userId;
    var _f = (0, react_1.useState)("1Y"), portPeriod = _f[0], setPortPeriod = _f[1];
    var _g = (0, react_1.useState)(), user = _g[0], setUser = _g[1], _h = (0, react_1.useState)(), watchlists = _h[0], setWatchlists = _h[1], 
    //authedUser = ensureCurrentUser(),
    translateHeaderY = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var dim = (0, react_native_1.useWindowDimensions)();
    var scrollRef = (0, react_1.useRef)(null);
    var bannerHeight = (0, ProfileBanner_1.useProfileBannerSize)(), headerHeight = bannerHeight + TabPanelSize + ButtonBarsize + ButtonMargin * 2 + titles + tabBarMargin;
    var clampMax = bannerHeight - ProfileBanner_1.profileImageSmall;
    var minViewHeight = dim.height - clampMax - StatusBarsize - headerHeight + bannerHeight + 2 * titles;
    var _j = (0, react_1.useState)(false), collapsed = _j[0], setCollapsed = _j[1];
    var _k = (0, react_1.useState)(false), isMaxed = _k[0], setIsMaxed = _k[1];
    var translation = translateHeaderY.interpolate({
        inputRange: [0, clampMax],
        outputRange: [0, -clampMax],
        extrapolate: 'clamp'
    });
    var manager = (0, react_1.useRef)([]).current;
    var appUser = (0, Authentication_1.useAppUser)().appUser;
    (0, react_1.useEffect)(function () {
        translation.addListener(function (v) {
            var c = Math.abs(v.value + clampMax) < ProfileBanner_1.profileImageSize - ProfileBanner_1.profileImageSmall + 8;
            var isMaxed = -v.value === clampMax;
            setCollapsed(c);
            setIsMaxed(isMaxed);
        });
        return function () { return translation.removeAllListeners(); };
    }, [translation, clampMax]);
    var _l = (0, react_1.useState)(0), tab = _l[0], setTab = _l[1];
    //const dashRef = useRef<any>()
    var toast = (0, react_native_toast_notifications_1.useToast)();
    (0, react_1.useEffect)(function () {
        if (userId && !user) {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, user_1, watchlists_1, ex_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Promise.all([
                                    api_1.Api.User.get(userId),
                                    api_1.Api.User.extensions.getWatchlists({ userId: userId })
                                ])];
                        case 1:
                            _a = _b.sent(), user_1 = _a[0], watchlists_1 = _a[1];
                            setWatchlists(watchlists_1);
                            setUser(user_1);
                            return [3 /*break*/, 3];
                        case 2:
                            ex_1 = _b.sent();
                            toast.show(ex_1.message);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })();
        }
    }, [userId, user]);
    return <react_native_1.View style={[style_1.flex]}>
        <react_native_1.Animated.FlatList data={[
            <ProfilePage style={{ paddingHorizontal: 0 }} index={0} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                    <FeedScreen_1.FeedPart userId={userId}/>
                </ProfilePage>,
            <ProfilePage index={1} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                     <Section_1.ElevatedSection title="Performance">
                    <react_native_1.View style={{ marginBottom: style_1.sizes.rem1 }}>
                        <InteractiveGraph_1["default"] performance={true}/>
                    </react_native_1.View>
                    <ButtonGroup_1.ButtonGroup key={"period"} items={["1D", "1W", "1M", "3M", "1Y", "2Y", "Max"].map(function (v) { return ({ label: v, value: v }); })} onValueChange={function (v) { return setPortPeriod(v); }} value={portPeriod}/>
                    </Section_1.ElevatedSection>
                    <Section_1.ElevatedSection title="Holdings">
                    </Section_1.ElevatedSection>
                    <WatchlistSection_1.WatchlistSection title="Watchlists" watchlists={watchlists}/>
                    {/* <WatchlistSection parentComponentId={props.componentId} userId={props.userId} /> */}
                </ProfilePage>,
            <ProfilePage index={2} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                    <Section_1.ElevatedSection title="">
                        <Table_1.Table keyExtractor={function (item, idx) {
                    return item ? "trade_" + idx : "empty";
                }} data={(function (a, $page) { return __awaiter(_this, void 0, void 0, function () {
                    var newArr, _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                newArr = a || [];
                                _b = (_a = newArr.push).apply;
                                _c = [newArr];
                                return [4 /*yield*/, api_1.Api.User.extensions.getTrades({ $page: $page, $limit: 20, settings: { user_id: userId } })];
                            case 1:
                                _b.apply(_a, _c.concat([(_d.sent())]));
                                console.log(JSON.stringify(newArr));
                                return [2 /*return*/, newArr];
                        }
                    });
                }); })} columns={__spreadArray(__spreadArray([], (0, WatchlistViewerScreen_1.useMakeSecurityFields)(function (item) {
                    return Number(item.security_id);
                }), true), [
                    { field: "date", stringify: function (a, b, c) { return String(a); } },
                    { field: "quantity", stringify: misc_1.toThousands },
                    { field: "price", stringify: misc_1.toThousands }
                ], false)}/>
                    </Section_1.ElevatedSection>
                </ProfilePage>,
            <ProfilePage index={3} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                    <Section_1.ElevatedSection title="General">
                        <Section_1.Subsection title="Biography">
                            <components_1.Text>{user === null || user === void 0 ? void 0 : user.bio}</components_1.Text>
                        </Section_1.Subsection>
                        <react_native_1.View style={style_1.row}>
                            <Section_1.Subsection title="Strategy" style={style_1.flex}>
                                <components_1.Text>{(_c = user === null || user === void 0 ? void 0 : user.analyst_profile) === null || _c === void 0 ? void 0 : _c.investment_strategy}</components_1.Text>
                            </Section_1.Subsection>
                            <Section_1.Subsection title="Benchmark" style={style_1.flex}>
                                <components_1.Text>{(_d = user === null || user === void 0 ? void 0 : user.analyst_profile) === null || _d === void 0 ? void 0 : _d.benchmark}</components_1.Text>
                            </Section_1.Subsection>
                        </react_native_1.View>
                        <Section_1.Subsection title="Interest &amp; Specialities" style={style_1.flex}>
                            <react_native_1.View style={{ flexDirection: "row" }}>
                                {(((_e = user === null || user === void 0 ? void 0 : user.analyst_profile) === null || _e === void 0 ? void 0 : _e.interests) || ["No", "Tags", "Here"]).map(function (chip, i) {
                    return <PrimaryChip_1.PrimaryChip isAlt key={i} label={chip} style={{ flex: 1 }}/>;
                })}
                            </react_native_1.View>
                        </Section_1.Subsection>
                    </Section_1.ElevatedSection>
                    {/* <ElevatedSection title="Competitions">
                    <Table elevated data={[]} columns={
                        [
                            {
                                field: "name",
                                align: "left"
                            },
                            {
                                field: "position",
                                alias: "# Rank",
                                width: 128
                            },
                            {
                                field: "endDate",
                                stringify: stringyDate,
                                width: 72
                            }
                        ]} />
                </ElevatedSection> */}
                    <Section_1.ElevatedSection title="Social Analytics"></Section_1.ElevatedSection>
                </ProfilePage>
        ]} renderItem={function (info) {
            return info.item;
        }} ref={scrollRef} contentContainerStyle={[{ paddingTop: headerHeight }]} nestedScrollEnabled onMomentumScrollEnd={function (ev) {
            var _a;
            if (collapsed && !isMaxed) {
                (_a = scrollRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: clampMax, animated: true });
                setIsMaxed(true);
            }
        }} onScroll={react_native_1.Animated.event([
            { nativeEvent: { contentOffset: { y: translateHeaderY } } }
        ], { useNativeDriver: true })}>
        </react_native_1.Animated.FlatList>
        <react_native_1.Animated.View style={{ position: "absolute", top: 0, backgroundColor: Colors_1.AppColors.background, transform: [{ translateY: translation }], alignItems: "stretch", width: "100%" }}>
            {/* <ElevatedSection style={{ alignItems: "center", width:"100%" }} title=""> */}
            <ProfileBanner_1.ProfileBanner navigator={props.navigation} profilePic={user === null || user === void 0 ? void 0 : user.profile_url} collapse={collapsed} bannerPic={""} extraMarginTop={collapseShift} platforms={(user === null || user === void 0 ? void 0 : user.claims) ? user === null || user === void 0 ? void 0 : user.claims.map(function (c) { return c.platform; }) : []}/>
            <react_native_1.View style={[collapsed ? style_1.row : undefined, { width: "100%", alignItems: "center" }]}>
                <react_native_1.View style={{ marginLeft: collapsed ? style_1.sizes.rem1 : 0 }}>
                    <components_1.Text style={{ color: "black", textAlign: !collapsed ? "center" : "left", fontSize: style_1.fonts.xSmall }}>@{(user === null || user === void 0 ? void 0 : user.handle) || ""}</components_1.Text>
                    <components_1.Text style={{ color: "black", textAlign: !collapsed ? "center" : "left", fontSize: style_1.fonts.medium }}>{user === null || user === void 0 ? void 0 : user.display_name}</components_1.Text>
                </react_native_1.View>
                {appUser && user && <SecondaryButton_1.SecondaryButton style={{
                width: "50%", marginVertical: ButtonMargin,
                marginLeft: "auto", marginRight: collapsed ? style_1.sizes.rem1 : "auto",
                backgroundColor: user.subscription.is_subscribed ? '#EC5328' : '#35A265',
                borderColor: user.subscription.is_subscribed ? '#EC5328' : '#35A265'
            }} {...(function () {
            var _a, _b;
            var children;
            var onPress;
            if (appUser && user && (user === null || user === void 0 ? void 0 : user.id) !== (appUser === null || appUser === void 0 ? void 0 : appUser.id)) {
                if (!user.subscription.is_subscribed) {
                    children = "Subscribe ".concat(((_a = user.subscription) === null || _a === void 0 ? void 0 : _a.cost) !== "$0.00" ? "".concat(user.subscription.cost, "/mo.") : "(Free)");
                    onPress = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, api_1.Api.Subscriber.insert({
                                        subscription_id: user.subscription.id,
                                        //TODO: this should be moved to the server side 
                                        start_date: new Date(),
                                        user_id: appUser === null || appUser === void 0 ? void 0 : appUser.id
                                    })];
                                case 1:
                                    _a.sent();
                                    setUser(undefined);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                }
                else {
                    children = 'Subscribed',
                        onPress = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: 
                                    //Todo:: make this an are you sure
                                    return [4 /*yield*/, api_1.Api.Subscriber.extensions.removeSubscription({
                                            subscriptionId: (_a = user.subscription) === null || _a === void 0 ? void 0 : _a.id
                                        })];
                                    case 1:
                                        //Todo:: make this an are you sure
                                        _b.sent();
                                        setUser(undefined);
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                }
            }
            else {
                if ((_b = user === null || user === void 0 ? void 0 : user.subscription) === null || _b === void 0 ? void 0 : _b.id) {
                    children = 'Manage Subscriptions';
                    onPress = function () { return props.navigation.navigate("Subscription"); };
                }
                else {
                    children = 'Become An Analyst';
                    onPress = function () { return props.navigation.navigate("SubscriptionSettings"); };
                }
            }
            return {
                children: children,
                onPress: onPress
            };
        })()}/>}
            </react_native_1.View>
            {/* </ElevatedSection> */}
            <Section_1.ElevatedSection title="" style={{ marginHorizontal: style_1.sizes.rem1, marginTop: tabBarMargin }}>
                <components_1.TabBar indicatorStyle={{
            marginTop: 26,
            marginHorizontal: 10
        }} style={{ width: "100%", marginHorizontal: 0 }} key={"tabbar"} selectedIndex={tab} onSelect={function (t) {
            var _a;
            if (collapsed)
                (_a = scrollRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: clampMax, animated: false });
            setTab(t);
        }}>
                    {["Posts", "Portfolio", "Trades", "About"].map(function (t) { return <components_1.Tab style={{ marginTop: -4 }} title={t}/>; })}
                </components_1.TabBar>
            </Section_1.ElevatedSection>
        </react_native_1.Animated.View>
    </react_native_1.View>;
    { /* </ScrollView> */ }
}
exports.ProfileScreen = ProfileScreen;
function ProfilePage(props) {
    props.manager[props.currentIndex] = true;
    return (props.index === props.currentIndex || props.manager[props.index]) ?
        <react_native_1.View style={[style_1.paddView, {
                    minHeight: props.minViewHeight,
                    display: props.currentIndex === props.index ? "flex" : "none"
                }, props.style]}>
            {props.children}
        </react_native_1.View> : null;
}
