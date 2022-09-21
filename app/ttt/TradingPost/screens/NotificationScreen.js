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
exports.NotificationsScreen = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_2 = require("react-native");
var components_1 = require("@ui-kitten/components");
var List_1 = require("../components/List");
var style_1 = require("../style");
var api_1 = require("@tradingpost/common/api");
var Section_1 = require("../components/Section");
var native_1 = require("@react-navigation/native");
var native_stack_1 = require("@react-navigation/native-stack");
var NotificationTradeScreen_1 = require("./NotificationTradeScreen");
var Stack = (0, native_stack_1.createNativeStackNavigator)();
var NotificationScreen = function () {
    return (<Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={"Root"} component={NotificationView}/>
            <Stack.Screen name={"NotificationTrade"} component={NotificationTradeScreen_1.NotificationTradeScreen}/>
        </Stack.Navigator>);
};
exports.NotificationsScreen = NotificationScreen;
var NotificationView = function () {
    return <react_native_2.View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
        <react_native_2.ScrollView>
            <components_1.Layout style={{
            backgroundColor: "#ffffff",
            paddingBottom: '2px',
            paddingTop: '2px',
            borderBottomColor: '#11146F',
            borderStyle: 'solid',
            borderBottomWidth: 2,
            marginBottom: 10
        }}>
                <components_1.Text style={{
            margin: 2,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: '600',
            color: '#11146F'
        }}>Notifications</components_1.Text>
            </components_1.Layout>
            <List_1.List key={"STATIC"} datasetKey={"__________"} getItemLayout={function (items, index, sizeCache) {
            var curItem = items === null || items === void 0 ? void 0 : items[index];
            return typeof curItem === 'object' ? sizeCache[index] : {
                index: index,
                offset: sizeCache[index - 1].offset + sizeCache[index - 1].length,
                length: 10
            };
        }} data={function (allItems, page, sizeCache) { return __awaiter(void 0, void 0, void 0, function () {
            var notifications, newNotifications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1.Api.Notification.extensions.listAlerts({
                            page: page
                        })];
                    case 1:
                        notifications = (_a.sent());
                        console.log("NOTIFICATIONS: ", notifications);
                        newNotifications = __spreadArray(__spreadArray([], (allItems || []), true), notifications, true);
                        newNotifications.forEach(function (item, index) {
                            if (!sizeCache[index]) {
                                sizeCache[index] = {
                                    index: index,
                                    offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                                    length: 0
                                };
                            }
                        });
                        return [2 /*return*/, newNotifications];
                }
            });
        }); }} keyExtractor={function (item, index) { return typeof item === 'string' ? "loadingtext" : (index + "_" + item._id); }} preloadOffset={1} renderItem={function (item) {
            if (typeof item.item === "string") {
                return <components_1.Text style={{ textAlign: "center", fontSize: style_1.fonts.large }}>Loading More...</components_1.Text>;
            }
            switch (item.item.type) {
                case "NEW_USER_INTERACTION":
                    return <UserInteractionNotification response={item.item}/>;
                case "NEW_TRADES":
                    return <NewTradeNotification response={item.item}/>;
                default:
                    console.error("Follow Type: ".concat(item.item.type, " not registered"));
                    return <DefaultNotification response={item.item}/>;
            }
        }} noDataMessage={"No Notifications Available"} loadingItem={" "}/>
        </react_native_2.ScrollView>
    </react_native_2.View>;
};
var NotificationTab = function (props) {
    return <Section_1.ElevatedSection title={""}>
        <react_native_2.View style={{ marginBottom: -style_1.sizes.rem0_5 }}>
            <react_native_2.View style={{ flexDirection: "row", width: "100%", marginBottom: style_1.sizes.rem0_5 }}>
                <react_native_2.View style={[style_1.flex, { marginLeft: style_1.sizes.rem0_5 }]}>
                    {props.children}
                </react_native_2.View>
            </react_native_2.View>
        </react_native_2.View>
    </Section_1.ElevatedSection>;
};
var NewTradeNotification = function (props) {
    var dt = new Date(props.response.dateTime);
    var dtFmt = "".concat(dt.getMonth(), "/").concat(dt.getDay(), "/").concat(dt.getFullYear() % 100);
    var nav = (0, native_1.useNavigation)();
    var openTrades = function () {
        nav.navigate("NotificationTrade");
    };
    return <NotificationTab>
        <react_native_1.Pressable onPress={openTrades}>
            <react_native_2.View style={{ flex: 1 }}>
                <react_native_2.View style={{ flexDirection: 'row' }}>
                    <components_1.Text style={{ marginRight: 10 }}>
                        {dtFmt}
                    </components_1.Text>
                    <components_1.Text>
                        {props.response.data.message} <components_1.Text style={{ fontWeight: 'bold' }}>Click to learn more.</components_1.Text>
                    </components_1.Text>
                </react_native_2.View>
            </react_native_2.View>
        </react_native_1.Pressable>
    </NotificationTab>;
};
var UserInteractionNotification = function (props) {
    var nav = (0, native_1.useNavigation)();
    var openProfile = function () {
        var _a, _b;
        if ((_a = props.response.data) === null || _a === void 0 ? void 0 : _a.userId) {
            nav.navigate("Profile", {
                userId: (_b = props.response.data) === null || _b === void 0 ? void 0 : _b.userId
            });
        }
    };
    var dt = new Date(props.response.dateTime);
    var dtFmt = "".concat(dt.getMonth(), "/").concat(dt.getDay(), "/").concat(dt.getFullYear() % 100);
    return <NotificationTab>
        <react_native_1.Pressable onPress={openProfile}>
            <react_native_2.View style={{ flex: 1 }}>
                <react_native_2.View style={{ flexDirection: 'row' }}>
                    <components_1.Text style={{ marginRight: 10 }}>
                        {dtFmt}
                    </components_1.Text>
                    <components_1.Text>
                        <components_1.Text style={{ fontWeight: "bold" }}>@{props.response.data.handle}</components_1.Text>{' '}{props.response.data.message}
                    </components_1.Text>
                </react_native_2.View>
            </react_native_2.View>
        </react_native_1.Pressable>
    </NotificationTab>;
};
var DefaultNotification = function (props) {
    return <NotificationTab>
        <components_1.Text>
            {props.response.data.message}
        </components_1.Text>
    </NotificationTab>;
};
