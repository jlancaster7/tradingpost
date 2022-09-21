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
exports.LinkBrokerageSection = void 0;
var components_1 = require("@ui-kitten/components");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var style_1 = require("../../style");
var bank_svg_1 = require("../../assets/bank.svg");
var SvgExpo_1 = require("../../components/SvgExpo");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Themed_1 = require("../../components/Themed");
var api_1 = require("@tradingpost/common/api");
var Section_1 = require("../../components/Section");
var Table_1 = require("../../components/Table");
var AddButton_1 = require("../../components/AddButton");
var expo_web_browser_1 = require("expo-web-browser");
var async_storage_1 = require("@react-native-async-storage/async-storage");
var native_1 = require("@react-navigation/native");
var LinkBrokerageSection = function (props) {
    var opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var _a = (0, react_1.useState)(), accounts = _a[0], setAccounts = _a[1];
    var intervalRef = (0, react_1.useRef)();
    var _b = (0, react_1.useState)(), needsRefresh = _b[0], setNeedsRefresh = _b[1];
    var openLink = function () { return __awaiter(void 0, void 0, void 0, function () {
        var browserName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    browserName = "finicity_auth";
                    return [4 /*yield*/, (0, expo_web_browser_1.openBrowserAsync)(brokerLink, { "windowName": browserName })];
                case 1:
                    _a.sent();
                    clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.log("WTF");
                                    return [4 /*yield*/, async_storage_1["default"].getItem("auth-finicity-code")];
                                case 1:
                                    if (!_b.sent()) return [3 /*break*/, 3];
                                    console.log("CODE HAS BEEN FOUND");
                                    _a = setAccounts;
                                    return [4 /*yield*/, api_1.Api.User.extensions.getBrokerageAccounts()];
                                case 2:
                                    _a.apply(void 0, [_b.sent()]);
                                    _b.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }, 5000);
                    return [2 /*return*/];
            }
        });
    }); };
    //cleanup
    (0, react_1.useEffect)(function () {
        async_storage_1["default"].removeItem("auth-finicity-code");
        return function () {
            clearInterval(intervalRef.current);
            async_storage_1["default"].removeItem("auth-finicity-code");
        };
    }, []);
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(opacityAnim, {
            delay: 0.75,
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    }, []);
    var _c = (0, react_1.useState)(""), brokerLink = _c[0], setLink = _c[1];
    (0, react_1.useEffect)(function () {
        api_1.Api.User.extensions.generateBrokerageLink(undefined).then(function (_a) {
            var link = _a.link;
            setLink(link);
        });
    }, [needsRefresh]);
    (0, react_1.useEffect)(function () {
        api_1.Api.User.extensions.getBrokerageAccounts().then(function (r) {
            setAccounts(r);
        });
    }, []);
    var linkTo = (0, native_1.useLinkTo)();
    return <ScrollWithButtons_1.ScrollWithButtons fillHeight buttons={{
            right: {
                text: "I'm Done Linking Accounts",
                onPress: function () {
                    linkTo('/create/addclaims');
                }
            }
        }}>
        <react_native_1.Animated.View style={[style_1.paddView, { opacity: opacityAnim }]}>
            <Section_1.ElevatedSection title={""} style={style_1.flex}>
                <components_1.Text style={[style_1.thinBannerText]}>Link Your Brokerage Accounts.</components_1.Text>
                <Themed_1.View style={{ padding: style_1.sizes.rem1 }}>
                    <SvgExpo_1.SvgExpo>
                        <bank_svg_1["default"] />
                    </SvgExpo_1.SvgExpo>
                </Themed_1.View>
                <components_1.Text style={{ marginVertical: style_1.sizes.rem1 }}>TradingPost links directly with your bank accounts to ....</components_1.Text>
                <Section_1.Section style={style_1.flex} title="Link Accounts" button={function (props) { return (accounts === null || accounts === void 0 ? void 0 : accounts.length) ? <AddButton_1.EditButton onPress={function () {
                openLink();
            }} height={props.height} width={props.width}/> : <AddButton_1.AddButton onPress={function () { return openLink(); }} height={props.height} width={props.width}/>; }}>
                    <Table_1.Table datasetKey={(accounts === null || accounts === void 0 ? void 0 : accounts.map(function (a) { return a.id; }).join(",")) || "none"} columns={[{ field: "broker_name", align: "left" }, { field: "account_number", align: "left" }]} data={accounts} noDataMessage="You have no linked accounts"/>
                </Section_1.Section>
            </Section_1.ElevatedSection>
        </react_native_1.Animated.View>
    </ScrollWithButtons_1.ScrollWithButtons>;
};
exports.LinkBrokerageSection = LinkBrokerageSection;
