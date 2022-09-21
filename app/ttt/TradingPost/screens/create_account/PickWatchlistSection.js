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
exports.PickWatchlistSection = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
//import { Navigation } from "react-native-navigation";
//import { Nav } from '@react-navigation/native'
var components_1 = require("@ui-kitten/components");
var style_1 = require("../../style");
var shared_1 = require("./shared");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var WatchlistApi_1 = require("@tradingpost/common/api/entities/apis/WatchlistApi");
var SvgExpo_1 = require("../../components/SvgExpo");
var analyze2_svg_1 = require("../../assets/analyze2.svg");
var WatchlistPicker_1 = require("../../components/WatchlistPicker");
var Section_1 = require("../../components/Section");
var native_1 = require("@react-navigation/native");
function PickWatchlistSection(props) {
    var _this = this;
    var _a = (0, shared_1.useChangeLock)(props), lockButtons = _a[0], setLockButtons = _a[1], opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current, _b = (0, WatchlistPicker_1.useWatchlistPicker)(), converterRef = _b.selectionConverter, selectedItems = _b.selectedItems, setSelectedItems = _b.onSelectedItemschanged, symbolConverter = _b.symbolConverter, linkTo = (0, native_1.useLinkTo)(), buttonConfig = {
        locked: lockButtons,
        left: {
            text: "Not Now",
            onPress: function () {
                linkTo('/create/analyststart');
            }
        },
        right: {
            text: "Apply",
            onPress: function () { return __awaiter(_this, void 0, void 0, function () {
                var ex_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!Object.keys(selectedItems).length) return [3 /*break*/, 1];
                            props.toastMessage("Please select at least one security of interest");
                            return [3 /*break*/, 5];
                        case 1:
                            setLockButtons(true);
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, WatchlistApi_1["default"].insert({
                                    items: (converterRef.current ? converterRef.current(selectedItems) : []).map(function (s) { return ({
                                        symbol: s.symbol
                                    }); }),
                                    name: "Primary Watchlist",
                                    type: "primary" //primary | private | public 
                                })];
                        case 3:
                            _a.sent();
                            linkTo('/create/analyststart');
                            return [3 /*break*/, 5];
                        case 4:
                            ex_1 = _a.sent();
                            props.toastMessage(ex_1.message);
                            setLockButtons(false);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); }
        }
    };
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(opacityAnim, {
            delay: 0.75,
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
        }).start();
    }, []);
    (0, react_1.useEffect)(function () {
        if (props.saveOnly)
            setLockButtons(!props.user.hasChanged);
    }, [props.saveOnly, props.user.hasChanged]);
    return <ScrollWithButtons_1.ScrollWithButtons fillHeight buttons={buttonConfig}>
        <react_native_1.View style={style_1.paddView}>
            <Section_1.ElevatedSection title="" style={[style_1.flex, style_1.noMargin]}>
                <react_native_1.Animated.View style={{ opacity: opacityAnim }}>
                    <react_native_1.Pressable onPress={function () {
            props.navigation.navigate("OverlayModal");
        }}><components_1.Text style={[style_1.thinBannerText, { marginVertical: style_1.sizes.rem0_5 }]}>
                            Help us get to know you.
                        </components_1.Text>
                    </react_native_1.Pressable>
                    <SvgExpo_1.SvgExpo style={{ width: "100%", aspectRatio: 1.5 }}>
                        <analyze2_svg_1["default"] />
                    </SvgExpo_1.SvgExpo>
                    <components_1.Text style={[style_1.bannerText, { marginHorizontal: 0, marginVertical: style_1.sizes.rem0_5 }]}>
                        Pick a few companies to help us tailor to your interests
                    </components_1.Text>
                </react_native_1.Animated.View>

                <WatchlistPicker_1.WatchlistPicker selectionConverter={converterRef} selectedItems={selectedItems} symbolConverter={symbolConverter} onSelectedItemschanged={function (_selectedItems) {
            setSelectedItems(_selectedItems);
            //TODO:::: need to put this logic back in 
            // if (selectedItemCount === 5 && isSelected) {
            //     props.toastMessage("You can only select up to 5 companies");
            //     return false;
            // }
            // else 
            // return false;
        }}/>
            </Section_1.ElevatedSection>
        </react_native_1.View>
    </ScrollWithButtons_1.ScrollWithButtons>;
}
exports.PickWatchlistSection = PickWatchlistSection;
