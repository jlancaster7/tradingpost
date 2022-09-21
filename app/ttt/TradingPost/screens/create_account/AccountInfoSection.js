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
exports.AccountInfoSection = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
var components_1 = require("@ui-kitten/components");
//import { signOut, getStoredCreds, CreateAuth0User, UpdateUserProfile, signInStoredCreds } from "../../apis/Authentication";
var ButtonField_1 = require("../../components/ButtonField");
var TextField_1 = require("../../components/TextField");
var style_1 = require("../../style");
var hooks_1 = require("../../utils/hooks");
var validators_1 = require("../../utils/validators");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var misc_1 = require("../../utils/misc");
var Colors_1 = require("../../constants/Colors");
var AuthApi_1 = require("@tradingpost/common/api/entities/static/AuthApi");
var Authentication_1 = require("../../Authentication");
var lds_1 = require("../../lds");
var native_1 = require("@react-navigation/native");
var shared_1 = require("./shared");
function AccountInfoSection(props) {
    var _this = this;
    var _a = (0, shared_1.useChangeLock)(props), lockButtons = _a[0], setLockButtons = _a[1], 
    //isAuthed = Boolean(props.login), //ensureAuthProps(props),
    isBroken = !(0, react_1.useMemo)(function () { return Boolean(props.user.data.first_name); }, []) || !(0, react_1.useMemo)(function () { return Boolean(props.user.data.last_name); }, []), _b = (0, lds_1.useData)("loginResult"), loginResult = _b.value, setLoginResult = _b.setValue, appUser = (0, Authentication_1.useAppUser)().appUser, 
    //isUnconfirmed = isAuthed && !isBroken,
    loginEntity = (0, hooks_1.useReadonlyEntity)({}), linkTo = (0, native_1.useLinkTo)(), refs = {
        first: (0, react_1.useRef)(null),
        last: (0, react_1.useRef)(null),
        email: (0, react_1.useRef)(null),
        username: (0, react_1.useRef)(null),
        pass: (0, react_1.useRef)(null),
        confirm: (0, react_1.useRef)(null)
    }, buttonConfig = {
        locked: lockButtons,
        left: (props.saveOnly ? undefined : {
            text: "Cancel",
            onPress: function () {
                if (props.navigation.canGoBack()) {
                    props.navigation.goBack();
                }
                else {
                    linkTo("/login");
                }
            }
        }),
        right: {
            text: props.saveOnly ? "Apply" : "Create",
            onPress: function () { return __awaiter(_this, void 0, void 0, function () {
                var errors, k, val, login, ex_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setLockButtons(true);
                            errors = [];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 8, , 9]);
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
                            return [3 /*break*/, 7];
                        case 2:
                            if (!!false) return [3 /*break*/, 6];
                            if (!(loginEntity.data.email && loginEntity.data.password)) return [3 /*break*/, 4];
                            return [4 /*yield*/, AuthApi_1["default"].createLogin(loginEntity.data.email, loginEntity.data.password)];
                        case 3:
                            login = _a.sent();
                            setLoginResult(login);
                            linkTo('/create/basicinfo');
                            return [3 /*break*/, 5];
                        case 4: throw new Error("Something is very wrong." + JSON.stringify(loginEntity.data));
                        case 5:
                            setLockButtons(false);
                            return [3 /*break*/, 7];
                        case 6:
                            //await UpdateUserProfile(props.user.data);
                            (0, misc_1.TBI)();
                            props.user.resetData(props.user.data);
                            if (!props.saveOnly)
                                linkTo('/create/basicinfo');
                            _a.label = 7;
                        case 7: return [3 /*break*/, 9];
                        case 8:
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
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); }
        }
    };
    (0, react_1.useEffect)(function () {
        if (props.saveOnly)
            setLockButtons(!props.user.hasChanged);
    }, [props.saveOnly, props.user.hasChanged]);
    return <ScrollWithButtons_1.ScrollWithButtons buttons={buttonConfig}>
        {//isUnconfirmed ? <UnverifiedEmail  {...props} />: 
        <AccountBasicInfo refs={refs} isAuthed={false} loginEntity={loginEntity} {...props}/>}
    </ScrollWithButtons_1.ScrollWithButtons>;
}
exports.AccountInfoSection = AccountInfoSection;
function AccountBasicInfo(props) {
    var refs = props.refs, isAuthed = props.isAuthed, opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(opacityAnim, {
            delay: 0.75,
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    }, []);
    return <react_native_1.View>
        <react_native_1.View style={[style_1.flex, { margin: shared_1.sideMargin }]}>
            <react_native_1.Animated.Text style={[style_1.bannerText, { opacity: opacityAnim }]}>
                Let's start with some login information
            </react_native_1.Animated.Text>
            {/* <Section title={'Personal Information'}>
            <TextField label='Name'
                validate={isRequired}
                errorMessage={"`Name` is required"}
                textInputRef={refs.first}
                validateOnChange placeholder='First Name' returnKeyType="none" {...bindTextInput(props.user, "first_name", null)} />
            <TextField
                label='Last'
                errorMessage={"`Last Name` is required"}
                textInputRef={refs.last}
                validate={isRequired}
                validateOnChange placeholder='Last Name' returnKeyType="none"  {...bindTextInput(props.user, "last_name", null)} />
        </Section> */}
            {/* <Section title={'Login Information'} > */}
            <TextField_1.TextField 
    //label='Email'
    style={style_1.textInputWiz} textInputRef={refs.email} errorMessage={"`Email Address` is invalid"} disabled={isAuthed} validate={validators_1.isValidEmail} validateOnChange placeholder='Email Address' returnKeyType="none" {...(0, hooks_1.bindTextInput)(props.loginEntity, "email", null)}/>
            {/* <TextField
                //label='Username'
                style={textInputWiz}
                textInputRef={refs.username}
                validate={isAlphaNumeric}
                validateOnChange
                disabled={isAuthed}
                errorMessage={"`Username` must be alphanumeric"}
                placeholder='Account Username' returnKeyType="none" {...bindTextInput(props.user, "handle", null)} /> */}
            {isAuthed ?
            <ButtonField_1.ButtonField compact isActive label='Password' activeText='Change'/>
            : <>
                        <TextField_1.TextField 
            //label='Password'
            style={style_1.textInputWiz} textInputRef={refs.pass} validate={validators_1.isRequired} validateOnChange errorMessage={"`Password` is required."} placeholder='Account Password' returnKeyType="none" secureTextEntry {...(0, hooks_1.bindTextInput)(props.loginEntity, "password", null)}/>
                        <TextField_1.TextField 
            //label='Confirm'
            style={style_1.textInputWiz} textInputRef={refs.confirm} placeholder='Confirm Password' returnKeyType="none" errorMessage={"'Confirm' does not match."} validateOnChange validate={function (c) { return Boolean(c) && c === props.loginEntity.data.password; }} secureTextEntry/>
                    </>}
            {/* </Section> */}
        </react_native_1.View>
    </react_native_1.View>;
}
function UnverifiedEmail(props) {
    return <react_native_1.View style={[style_1.flex, { margin: shared_1.sideMargin }]}>
        <react_native_1.View>
            {/* <Text style={{ fontSize:sizes.rem1_5 }}>Email verification is required for:</Text> */}
            <components_1.Text style={{ fontSize: style_1.sizes.rem1 * 1.25, alignSelf: "center" }}>Please verify your account</components_1.Text>
            <react_native_1.View style={{ marginBottom: style_1.sizes.rem1, marginTop: style_1.sizes.rem1, backgroundColor: "white", borderColor: "#ccc", padding: style_1.sizes.rem1, borderWidth: 1, alignSelf: "center", shadowColor: "black", shadowRadius: 10, elevation: 4 }}>
                <react_native_1.Image source={{ uri: props.user.data.profile_url, height: 120, width: 120 }} height={120} width={120} style={{ marginBottom: style_1.sizes.rem1 / 2, borderRadius: 60, alignSelf: "center" }}/>
                <components_1.Text style={{ marginBottom: style_1.sizes.rem1 / 2, color: Colors_1.AppColors.primary, fontWeight: "bold", fontSize: style_1.sizes.rem1, alignSelf: "center" }}>@{props.user.data.handle}</components_1.Text>
                <components_1.Text style={{ fontSize: style_1.sizes.rem1, alignSelf: "center", color: "black" }}>{props.user.data.display_name}</components_1.Text>
            </react_native_1.View>
            <components_1.Text style={{ fontSize: style_1.sizes.rem1 * 1.25, alignSelf: "center" }}>An email has been sent to:</components_1.Text>
            <components_1.Text style={{ fontWeight: "bold", fontSize: style_1.sizes.rem1 * 1.25, alignSelf: "center" }}>{props.user.data.email}</components_1.Text>
        </react_native_1.View>
    </react_native_1.View>;
}
