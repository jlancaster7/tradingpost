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
exports.BasicInfoSection = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var TextField_1 = require("../../components/TextField");
var style_1 = require("../../style");
var hooks_1 = require("../../utils/hooks");
var validators_1 = require("../../utils/validators");
var shared_1 = require("./shared");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var AuthApi_1 = require("@tradingpost/common/api/entities/static/AuthApi");
var Authentication_1 = require("../../Authentication");
var native_1 = require("@react-navigation/native");
function BasicInfoSection(props) {
    var _this = this;
    var _a = (0, shared_1.useChangeLock)(props), lockButtons = _a[0], setLockButtons = _a[1], opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current, _b = (0, Authentication_1.useAppUser)(), signIn = _b.signIn, appUser = _b.appUser, refs = {
        first: (0, react_1.useRef)(null),
        last: (0, react_1.useRef)(null),
        username: (0, react_1.useRef)(null)
    }, linkTo = (0, native_1.useLinkTo)(), buttonConfig = {
        locked: lockButtons,
        left: {
            text: "Sign Out",
            onPress: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    AuthApi_1["default"].signOut();
                    props.navigation.goBack();
                    return [2 /*return*/];
                });
            }); }
        }
        // : (props.saveOnly ? undefined : {
        //     text: "Cancel",
        //     onPress: () => props.navigation.goBack()//Navigation.pop(props.componentId)
        // })
        ,
        right: {
            text: props.saveOnly ? "Apply" : "Next",
            onPress: function () { return __awaiter(_this, void 0, void 0, function () {
                var errors, k, val, token, ex_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setLockButtons(true);
                            errors = [];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, , 7]);
                            for (k in refs) {
                                val = refs[k];
                                if (val.current && !val.current.validate()) {
                                    errors.push(val.current.errorMessage || "");
                                }
                            }
                            if (!errors.length) return [3 /*break*/, 2];
                            errors.unshift("Please fix the following issues:");
                            props.toastMessage(errors.join("\r\n"));
                            setLockButtons(false);
                            return [3 /*break*/, 5];
                        case 2: return [4 /*yield*/, AuthApi_1["default"].createUser(props.user.data.first_name, props.user.data.last_name, props.user.data.handle)];
                        case 3:
                            token = (_a.sent()).token;
                            return [4 /*yield*/, signIn("", token)];
                        case 4:
                            _a.sent();
                            linkTo('/create/watchlist');
                            _a.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            ex_1 = _a.sent();
                            if (ex_1.json) {
                                props.toastMessage("".concat(ex_1.json.name, ":\r\n").concat(ex_1.json.policy || ex_1.json.description));
                            }
                            else if (typeof ex_1.message === "string") {
                                props.toastMessage(ex_1.message);
                            }
                            else
                                props.toastMessage(JSON.stringify(ex_1.message));
                            setLockButtons(false);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); }
        }
    }, navigation = props.navigation;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(opacityAnim, {
            delay: 0.75,
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    }, []);
    (0, react_1.useEffect)(function () {
        if (props.saveOnly)
            setLockButtons(!props.user.hasChanged);
    }, [props.saveOnly, props.user.hasChanged]);
    return <ScrollWithButtons_1.ScrollWithButtons buttons={buttonConfig}>
        <react_native_1.View>
            <react_native_1.View style={[style_1.flex, { margin: shared_1.sideMargin }]}>
                <react_native_1.Animated.Text style={[style_1.bannerText, { opacity: opacityAnim }]}>
                    Let's keep setting up your account
                </react_native_1.Animated.Text>
                <TextField_1.TextField style={style_1.textInputWiz} textInputRef={refs.first} errorMessage={"`First Name` is required"} validate={validators_1.isRequired} validateOnChange placeholder='First Name' returnKeyType="none" {...(0, hooks_1.bindTextInput)(props.user, "first_name", null)}/>
                <TextField_1.TextField style={style_1.textInputWiz} textInputRef={refs.last} errorMessage={"`Last Name` is required"} validate={validators_1.isRequired} validateOnChange placeholder='Last Name' returnKeyType="none" {...(0, hooks_1.bindTextInput)(props.user, "last_name", null)}/>
                <TextField_1.TextField style={style_1.textInputWiz} textInputRef={refs.username} errorMessage={"`Username` is required"} validate={validators_1.isRequired} validateOnChange placeholder='Username' returnKeyType="none" {...(0, hooks_1.bindTextInput)(props.user, "handle", null)}/>
            </react_native_1.View>
        </react_native_1.View>
    </ScrollWithButtons_1.ScrollWithButtons>;
}
exports.BasicInfoSection = BasicInfoSection;
