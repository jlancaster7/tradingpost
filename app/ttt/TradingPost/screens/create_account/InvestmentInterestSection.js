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
exports.InvestmentInterestSection = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
var Section_1 = require("../../components/Section");
var style_1 = require("../../style");
var Picker_1 = require("../../components/Picker");
var shared_1 = require("./shared");
var hooks_1 = require("../../utils/hooks");
var SecurityList_1 = require("../../SecurityList");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var react_native_1 = require("react-native");
var Slider_1 = require("../../components/Slider");
var api_1 = require("@tradingpost/common/api");
var AddButton_1 = require("../../components/AddButton");
var native_1 = require("@react-navigation/native");
//import { AppConfig } from "../../apis/ApplicationApi"
var investmentStrats = [
    'Buy & Hold',
    'Growth-Focused',
    'Swing Trading',
    'Momentum',
    'Day Trading',
    'Index Investing',
    'Value-Focused',
    'Long/Short',
    'Opportunistic ',
    'Concetrated',
    'Diversified'
];
var questionStyle = { fontSize: 16, marginBottom: style_1.sizes.rem1, marginTop: style_1.sizes.rem1_5 };
var gicsAC = ['SaaS',
    'Biotech',
    'AdTech',
    'Tech',
    'Fintech',
    'Specialty Finance',
    'Aero/Defense',
    'Industrial',
    'Medtech',
    'Cloud',
    'Consumer',
    'Banks',
    'Industrials',
    'Healthcare',
    'Housing',
    'Electric Vehicles',
    'Renewable Energy',
    'Oil and Gas',
    'Metals and Mining',
    'Semiconductors',
    'Cybersecurity',
    'Metaverse',
    'Crypto',
    'Transportation',
    'Airlines',
    'Auto',
    'Healthcare',
    'Retail',
    'E-commerce',
    'Insurance',
    'Gambling',
    'Quality',
    'Deep Dives',
    'General Market',
    'Valuation',
    'Technicals',
    'Investment Process',
    'Small Caps',
    'Macro',
    'News',
    'Venture Capital',
    'Emerging Markets',
    'Portfolio Management',
    'Data Driven',
    'Industry Expert',
    'Financial Coach',
    'Businesses',
    'Special Situations',
    'Activist'].sort();
function InvestmentInterestSection(props) {
    var _this = this;
    var AppearView = (0, hooks_1.useOpacityAnim)().AppearView;
    var anaylistProfile = (0, hooks_1.useReadonlyEntity)(props.user.data.analyst_profile || {
        investment_strategy: "",
        portfolio_concentration: 50,
        benchmark: "",
        interests: []
    });
    //props.user.data.investment_interests || { interestLevel: 50 }
    var securities = (0, SecurityList_1.useSecuritiesList)().securities.list;
    var _a = (0, shared_1.useChangeLock)(props, [anaylistProfile]), lockButtons = _a[0], setLockButtons = _a[1];
    var _b = (0, react_1.useState)(100), sliderWidth = _b[0], setSliderWidth = _b[1];
    var linkTo = (0, native_1.useLinkTo)();
    var _c = (0, react_1.useState)(""), acText = _c[0], setAcText = _c[1];
    var acValues = (0, react_1.useMemo)(function () {
        var r = new RegExp(acText, "i");
        return acText ? gicsAC.filter(function (g, i) { return r.test(g); }) : [];
    }, [acText]);
    var addIfMissing = function (value) {
        if (value && !anaylistProfile.data.interests.find(function (int) { return int.toLowerCase() === value.toLowerCase(); })) {
            anaylistProfile.update({
                "interests": __spreadArray(__spreadArray([], anaylistProfile.data.interests, true), [value], false)
            });
        }
        setAcText("");
    };
    var benches = securities.filter(function (s) { return s.is_benchmark; }).sort(function (a, b) { return a.symbol.localeCompare(b.symbol); }).map(function (value) { return ({
        label: "[".concat(value.symbol, "] ").concat(value.security_name),
        value: value.symbol,
        iconUrl: value.logo_url
    }); });
    return <ScrollWithButtons_1.ScrollWithButtons buttons={{
            locked: lockButtons,
            left: props.saveOnly ? undefined : {
                text: "Nevermind",
                onPress: function () { return linkTo('/create/profilepicture'); }
            },
            right: {
                text: props.saveOnly ? "Apply" : "Continue",
                onPress: function () { return __awaiter(_this, void 0, void 0, function () {
                    var ex_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setLockButtons(true);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                //await UpdateUserProfile({ investment_interests: interestEntity.data });
                                //props.user.update({ investment_interests: interestEntity.data })
                                return [4 /*yield*/, api_1.Api.User.update(props.user.data.id, {
                                        analyst_profile: anaylistProfile.data
                                    })];
                            case 2:
                                //await UpdateUserProfile({ investment_interests: interestEntity.data });
                                //props.user.update({ investment_interests: interestEntity.data })
                                _a.sent();
                                anaylistProfile.resetData(anaylistProfile.data);
                                props.user.resetData(props.user.data);
                                if (!props.saveOnly)
                                    linkTo('/create/linkbrokerage');
                                return [3 /*break*/, 4];
                            case 3:
                                ex_1 = _a.sent();
                                console.error(ex_1);
                                props.toastMessage("Unable to update profile");
                                setLockButtons(false);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }
            }
        }}>
        <react_native_1.View style={style_1.paddView}>
            <Section_1.ElevatedSection title="" style={[]}>
                <AppearView onLayout={function (ev) {
            setSliderWidth(ev.nativeEvent.layout.width);
        }} style={[style_1.flex]}>
                    <components_1.Text style={[style_1.thinBannerText, { marginHorizontal: 0, marginVertical: style_1.sizes.rem0_5 }]}>Welcome Analyst! Tell us a bit about yourself</components_1.Text>
                    <components_1.Text style={questionStyle}>What is your investment strategy?</components_1.Text>
                    <Picker_1.Picker placeholder='Select Strategy' 
    //showSearch
    // topBarProps={{
    //     title: "Portfolio Strategy"
    // } as ModalTopBarProps}
    value={anaylistProfile.data.investment_strategy} items={investmentStrats.map(function (value) { return ({
            label: value,
            value: value
        }); })} {...(0, hooks_1.bindPicker)(anaylistProfile, "investment_strategy", {
        fromType: function (v) {
            if (v) {
                return investmentStrats[v.row];
            }
            return "";
        },
        toType: function (v) {
            return new components_1.IndexPath(investmentStrats.findIndex(function (v) { return v === v; }));
        }
    })}/>
                    <components_1.Text style={questionStyle}>How concentrated is your portfolio?</components_1.Text>
                    <Slider_1.Slider containerStyle={{
            marginLeft: sliderWidth * 0.05
        }} min={0} max={100} step={25} sliderLength={sliderWidth * 0.9} values={[anaylistProfile.data.portfolio_concentration || 50]} onValuesChange={function (v) {
            anaylistProfile.update({
                portfolio_concentration: v[0]
            });
        }}/>
                    <react_native_1.View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                        <components_1.Text>Highly Diversified</components_1.Text>
                        <components_1.Text>Very Concentrated</components_1.Text>
                    </react_native_1.View>
                    <components_1.Text style={questionStyle}>What benchmark do you follow?</components_1.Text>
                    <Picker_1.Picker value={anaylistProfile.data.benchmark} placeholder='Select Benchmark' items={benches} {...(0, hooks_1.bindPicker)(anaylistProfile, "benchmark", {
        fromType: function (v) {
            if (v) {
                return benches[v.row].value;
            }
            return "";
        },
        toType: function (v) {
            return new components_1.IndexPath(benches.findIndex(function (v) { return v === v; }));
        }
    })}/>
                    <components_1.Text style={questionStyle}>Pick a few interest and specialties</components_1.Text>
                    <react_native_1.View>
                        <components_1.Autocomplete value={acText || ""} onChangeText={setAcText} placeholder="Interest &amp; Specialties" placement="bottom" accessoryRight={function (props) {
            var _a, _b;
            return <AddButton_1.AddButton onPress={function () { return addIfMissing(acText); }} height={(_a = props === null || props === void 0 ? void 0 : props.style) === null || _a === void 0 ? void 0 : _a.height} width={(_b = props === null || props === void 0 ? void 0 : props.style) === null || _b === void 0 ? void 0 : _b.width}/>;
        }} onSelect={function (idx) { return addIfMissing(acValues[idx]); }}>{acValues.map(function (v, i) { return <components_1.AutocompleteItem key={i} title={v}/>; })}
                        </components_1.Autocomplete>
                    </react_native_1.View>
                    {anaylistProfile.data.interests.map(function (v, i) { return <react_native_1.View style={{ padding: style_1.sizes.rem0_5, flexDirection: "row" }}>
                            <components_1.Text style={{ textAlign: "left", flex: 1 }}>{v}</components_1.Text><react_native_1.Pressable onPress={function () {
                var newInterest = __spreadArray([], anaylistProfile.data.interests, true);
                newInterest.splice(i, 1);
                anaylistProfile.update({
                    interests: newInterest
                });
            }}><components_1.Icon name="close-outline" style={{ height: 24, aspectRatio: 1 }}/></react_native_1.Pressable>
                        </react_native_1.View>; })}
                </AppearView>
            </Section_1.ElevatedSection>
        </react_native_1.View>
    </ScrollWithButtons_1.ScrollWithButtons>;
}
exports.InvestmentInterestSection = InvestmentInterestSection;
