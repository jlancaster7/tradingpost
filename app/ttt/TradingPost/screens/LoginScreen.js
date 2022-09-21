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
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
var TextField_1 = require("../components/TextField");
//import { BaseScreen, BaseScreenProps, IDashboard, screens } from '../layouts/BaseLayout';
var PrimaryButton_1 = require("../components/PrimaryButton");
//import { Incubator, View } from 'react-native-ui-lib';
var Link_1 = require("../components/Link");
var style_1 = require("../style");
//import AuthApi from '../api/entities/apis/AuthApi';
var images_1 = require("../images");
//import { Screen } from './BaseScreen';
//import { resetPassword, signInWithPassword } from '../apis/Authentication';
//import { ToastProps } from 'react-native-ui-lib/typings';
exports["default"] = (function () {
    var userRef = (0, react_1.useRef)(null), passRef = (0, react_1.useRef)(null), _a = (0, react_1.useState)(''), username = _a[0], setUsername = _a[1], _b = (0, react_1.useState)(''), password = _b[0], setPassword = _b[1], _c = (0, react_1.useState)(false), loggingIn = _c[0], setLoggingIn = _c[1], 
    //{ isKeyboardVisible } = useIsKeyboardVisible(),
    //  { toastMessage, toastProps } = useToast(),
    _d = (0, react_1.useState)(false), resetMode = _d[0], setResetMode = _d[1];
    //dashboardRef = useRef<IDashboard>()
    var scaleHeader = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    return <react_native_1.View style={style_1.paddView}><react_native_1.Animated.View style={{
            alignItems: "center",
            transform: [{
                    scaleY: scaleHeader
                }]
        }}>
            <images_1.IconBg height={256} width={256}/>
            <images_1.AppTitle />
        </react_native_1.Animated.View>
        <TextField_1.TextField label='Username' placeholder='TradingPost Username' returnKeyType="next" onChangeText={function (name) { return setUsername(name); }} 
    //validateOnChange
    textInputRef={userRef}/>
        {!resetMode && <>
                <TextField_1.TextField 
        //containerStyle={{ height: 64 }}
        label='Password' 
        //validate={isRequired}
        onChangeText={function (pass) { return setPassword(pass); }} placeholder='TradingPost Password' 
        //errorMessage="Invalid Password"
        //validateOnChange
        secureTextEntry textInputRef={passRef}/>
                <Link_1.Link style={{ paddingTop: 4, paddingBottom: 16, alignSelf: "flex-end" }} onPress={function () { return setResetMode(true); }}>Forgot Password?</Link_1.Link>

            </>}
        {resetMode &&
            <PrimaryButton_1.PrimaryButton disabled={loggingIn} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        setLoggingIn(true);
                        try {
                            //          await resetPassword(username);
                        }
                        catch (ex) {
                            //We should always say an email is sent for now.
                        }
                        finally {
                            //    dashboardRef.current?.toastMessage("Reset email has been sent.")
                            setLoggingIn(false);
                            setResetMode(false);
                        }
                        return [2 /*return*/];
                    });
                }); }}>Reset Password</PrimaryButton_1.PrimaryButton>}


        <react_native_1.View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 8, marginTop: "auto", minHeight: 30 }}>
            <Link_1.Link>Privacy Policy</Link_1.Link>
            <Link_1.Link>Terms Of Use</Link_1.Link>
        </react_native_1.View>
    </react_native_1.View>;
});
