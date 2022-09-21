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
var react_1 = require("react");
//import { Text, View } from "react-native-ui-lib";
//import { LoginButtons } from "../components/LoginButtons";
var images_1 = require("../images");
//import { Screen } from "./BaseScreen";
//import CreateAccountScreen from "./CreateAccountScreen";
var style_1 = require("../style");
var react_native_svg_1 = require("react-native-svg");
var Link_1 = require("../components/Link");
var react_native_1 = require("react-native");
var LoginButtons_1 = require("../components/LoginButtons");
var native_1 = require("@react-navigation/native");
var components_1 = require("@ui-kitten/components");
var react_2 = require("react");
var TextField_1 = require("../components/TextField");
var Section_1 = require("../components/Section");
//import { BaseScreenProps } from "../layouts/BaseLayout";
//import LoginScreen from "./LoginScreen";
//import { LoginButtons } from "../components/LoginButtons";
//import Auth from '@tradingpost/common/api/entities/static/AuthApi'
//import UserApi from '@tradingpost/common/api/entities/apis/UserApi'
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
//import { PublicPages } from "../navigation";
//import { EntityApiBase } from "@tradingpost/common/api/entities/static/EntityApiBase";
var Authentication_1 = require("../Authentication");
var lds_1 = require("../lds");
//import { resetEnsureUser } from "../components/EnsureUser";
var styles = react_native_1.StyleSheet.create({
    tab: {
        height: 192,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
var ensureG = function (child) {
    return child.type === react_native_svg_1.G;
};
//Test function will move out into helper later 
var SvgMagic = function (props) {
    var reportChildren = function (children) {
        react_1.Children.forEach(children, function (child) {
            if (ensureG(child))
                console.log("FOUND G WITH ID:::::::" + child.props.id);
            else {
                console.log("FOUND SOMETHING:::::::" + child.type.name);
                console.log("FOUND SOMETHINGS CHIULDREN:::::::" + (JSON.stringify(child.props)));
            }
            reportChildren(child.props.children);
        });
    };
    reportChildren(props.children);
    return props.children;
};
// class WelcomeScreen extends Screen<WelcomeScreenProps> {
//     layoutProps: BaseScreenProps = {
//         scrollContentFlex: true
//     }
//     Content = (p: WelcomeScreenProps & { componentId: string }) => {
//         return <><View style={[...paddView, { height: "100%", backgroundColor: "white" }]}>
//             <AppTitle style={{ marginVertical: sizes.rem2, alignSelf: "center" }} />
//             <SplashWelcome style={{ backgroundColor: "orange", width: "100%", aspectRatio: 1.5 }} />
//             <Text style={{ textAlign: "center", margin: sizes.rem2, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>Welcome to the team!</Text>
//             <LoginButtons
//                 createAccountProps={{
//                     onPress: () => {
//                     //    CreateAccountScreen.open(p.componentId, {});
//                     }
//                 }}
//                 loginProps={{
//                 //    onPress: () => LoginScreen.open(p.componentId, {})
//                 }}
//             />
//         </View>
//             <Link style={{ textAlign: "right", position: "absolute", bottom: sizes.rem1, right: sizes.rem1, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>What is TradingPost{">>"}</Link>
//         </>
//     };
// }
//console.log("MY app type is " + typeof AppTitle)
exports["default"] = (function (_a) {
    var navigation = _a.navigation;
    var cleanUp = (0, react_1.useRef)(), _b = (0, react_2.useState)(0), selectedIndex = _b[0], setSelectedIndex = _b[1];
    (0, react_1.useEffect)(function () {
        //resetEnsureUser();
        return function () { return clearInterval(cleanUp.current); };
    }, []);
    var userRef = (0, react_1.useRef)(null), passRef = (0, react_1.useRef)(null), _c = (0, react_2.useState)(''), username = _c[0], setUsername = _c[1], _d = (0, react_2.useState)(''), password = _d[0], setPassword = _d[1], _e = (0, react_2.useState)(false), loggingIn = _e[0], setLoggingIn = _e[1], 
    //{ isKeyboardVisible } = useIsKeyboardVisible(),
    //{ toastMessage, toastProps } = useToast(),
    _f = (0, react_2.useState)(false), resetMode = _f[0], setResetMode = _f[1], intervalRef = (0, react_1.useRef)(), opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current, toast = (0, react_native_toast_notifications_1.useToast)(), _g = (0, Authentication_1.useAppUser)(), appUser = _g.appUser, signIn = _g.signIn, authToken = _g.authToken, loginResult = _g.loginResult, hasAuthed = (0, lds_1.useData)("hasAuthed").value;
    var linkTo = (0, native_1.useLinkTo)();
    (0, react_1.useLayoutEffect)(function () {
        ///*|| loginResult*
        if (appUser || loginResult) {
            console.log("Has authed is ....." + hasAuthed);
            if (!appUser || !hasAuthed) {
                navigation.navigate("Create", {});
            }
            else {
                navigation.navigate("Dash");
            }
        }
    }, [appUser, loginResult]);
    return <><react_native_1.View style={__spreadArray(__spreadArray([], style_1.paddView, true), [{ justifyContent: "center", backgroundColor: "white" }], false)}>
        <images_1.AppTitle style={{ marginVertical: style_1.sizes.rem1, alignSelf: "center", width: "100%", aspectRatio: 5 }}/>

        <components_1.TabView selectedIndex={selectedIndex} onSelect={function (index) {
            //TODO: investigate whats happenign here. This is not normal....            
            //console.log("VALUE IS BEING SET TO " + (index === NaN ? 1 : index))
            setSelectedIndex(isNaN(index) ? 0 : index);
        }} style={{
            width: "100%"
        }} indicatorStyle={{
            height: 0
        }} tabBarStyle={{
            height: 0
        }}>
            <components_1.Tab>
                <WTF_View onReady={function (item) {
            if (react_native_1.Platform.OS === "web" && item instanceof HTMLDivElement) {
                var stonks_1 = ["fb", "tsla", "nvda", "btc", "ether", "doge"].map(function (n) { return item.querySelector("[id=".concat(n, "]")); });
                stonks_1.forEach(function (s) {
                    if (s)
                        s.style.opacity = "0";
                });
                var lastItem_1 = null;
                var lastItem2_1 = null;
                if (intervalRef.current)
                    clearInterval(intervalRef.current);
                intervalRef.current = setInterval(function () {
                    var index = Math.floor(Math.random() * (9));
                    var index2 = Math.floor(Math.random() * (9));
                    if (lastItem_1)
                        lastItem_1.style.opacity = "0";
                    if (lastItem2_1)
                        lastItem2_1.style.opacity = "0";
                    lastItem_1 = stonks_1[index];
                    lastItem2_1 = stonks_1[index2];
                    if (lastItem_1)
                        lastItem_1.style.opacity = "1";
                    if (lastItem2_1)
                        lastItem2_1.style.opacity = "1";
                }, 1000);
            }
        }}/>
            </components_1.Tab>
            <components_1.Tab>
                <Section_1.Section title="Login">
                    <TextField_1.TextField placeholder='Username' returnKeyType="next" onChangeText={function (name) { return setUsername(name); }} 
    //validateOnChange
    textInputRef={userRef} style={{ marginVertical: style_1.sizes.rem1 }}/>

                    <TextField_1.TextField 
    //containerStyle={{ height: 64 }}
    //label='Password'
    //validate={isRequired}
    onChangeText={function (pass) { return setPassword(pass); }} placeholder='Password' style={{ marginVertical: style_1.sizes.rem1 }} 
    //errorMessage="Invalid Password"
    //validateOnChange
    secureTextEntry textInputRef={passRef}/>
                    <Link_1.Link style={{ paddingTop: 4, paddingBottom: 16, alignSelf: "flex-end" }} onPress={function () { return setResetMode(true); }}>Forgot Password?</Link_1.Link>
                </Section_1.Section>
            </components_1.Tab>
        </components_1.TabView>

        <react_native_1.Animated.Text style={[style_1.bannerText, {
                opacity: !selectedIndex ? 1 : opacityAnim
            }]}> {!selectedIndex ? "Welcome to the team!" : "Hey... Welcome Back!"}</react_native_1.Animated.Text>
        <LoginButtons_1.LoginButtons createAccountProps={{
            onPress: function () {
                linkTo("/create/logininfo");
                //navigation.navigate("Create");
                //CreateAccountScreen.open(p.componentId, {});
            }
        }} loginProps={{
            onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                var ex_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!selectedIndex) return [3 /*break*/, 1];
                            setSelectedIndex(1);
                            react_native_1.Animated.timing(opacityAnim, {
                                delay: 0.75,
                                toValue: 1,
                                duration: 2000,
                                useNativeDriver: true
                            }).start();
                            return [3 /*break*/, 4];
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, signIn(username, password)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            ex_1 = _a.sent();
                            toast.show(ex_1.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }
            //setGlobalUser(true)
        }}/>

    </react_native_1.View>
        {!selectedIndex && <Link_1.Link style={{ textAlign: "right", position: "absolute", bottom: style_1.sizes.rem1, right: style_1.sizes.rem1, fontSize: style_1.fonts.large, lineHeight: style_1.fonts.large * 1.5 }}>What is TradingPost{">>"}</Link_1.Link>}
    </>;
});
var WTF_View = function (props) {
    return <react_native_1.View style={{ width: "100%", aspectRatio: 1.5 }}>
        <images_1.SplashWelcome onReady={props.onReady}/>
    </react_native_1.View>;
};
