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
exports.WatchlistEditorScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var ButtonGroup_1 = require("../components/ButtonGroup");
var ScrollWithButtons_1 = require("../components/ScrollWithButtons");
var Section_1 = require("../components/Section");
var TextField_1 = require("../components/TextField");
var WatchlistPicker_1 = require("../components/WatchlistPicker");
var style_1 = require("../style");
var WatchlistEditorScreen = function (props) {
    var _a, _b, _c, _d, _e, _f;
    var pickerProps = (0, WatchlistPicker_1.useWatchlistPicker)();
    var _g = (0, react_1.useState)(""), name = _g[0], setName = _g[1];
    var _h = (0, react_1.useState)(), note = _h[0], setNote = _h[1];
    var _j = (0, react_1.useState)("public"), type = _j[0], setWatchlistType = _j[1];
    var watchlistId = (_b = (_a = props.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.watchlistId;
    //TODO: HACK need to clean this u
    var _k = (0, react_1.useState)(true), magic = _k[0], setMagic = _k[1];
    var toast = (0, react_native_toast_notifications_1.useToast)();
    (0, react_1.useEffect)(function () {
        var converter = pickerProps.symbolConverter.current;
        if (watchlistId && converter)
            if (watchlistId > 0) {
                api_1.Api.Watchlist.get(watchlistId).then(function (watchlist) {
                    //TODO: need to deal with settings for primary watchlist
                    setName(watchlist.name);
                    setWatchlistType(watchlist.type);
                    setNote(watchlist.note);
                    var selectedItems = converter(watchlist.items.map(function (s) { return s.symbol; }));
                    pickerProps.onSelectedItemschanged(selectedItems);
                    //TODO:: need to cache items notes since this is an delete and insert style update
                })["catch"](function (ex) {
                    toast.show(ex.message);
                });
            }
            else {
                setName("Primary Watchlists");
                setWatchlistType("primary");
            }
    }, [watchlistId, Boolean(pickerProps.symbolConverter.current)]);
    return <react_native_1.View style={style_1.paddView}>
        {type !== "primary" &&
            <Section_1.ElevatedSection title={(((_d = (_c = props.route) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.watchlistId) ? "Edit" : "Create") + " Watchlist"}>
                <react_native_1.View style={{ flexDirection: "column", margin: style_1.sizes.rem0_5 }}>
                    <ButtonGroup_1.ButtonGroup value={type} onValueChange={function (value) {
                    setWatchlistType(value);
                }} items={[{ label: "Public", value: "public" }, { label: "Private", value: "private" }]}/>
                    <TextField_1.TextField value={name} onChangeText={function (v) { return setName(v || ""); }} placeholder="Watchlist Name" style={{ flex: 1, marginBottom: style_1.sizes.rem1 }}/>
                    <TextField_1.TextField value={note} onChangeText={function (v) { return setNote(v || ""); }} placeholder="Wathlist Note" style={{ flex: 1 }}/>
                </react_native_1.View>
            </Section_1.ElevatedSection>}

        <ScrollWithButtons_1.ScrollWithButtons fillHeight buttons={{
            right: {
                text: ((_f = (_e = props.route) === null || _e === void 0 ? void 0 : _e.params) === null || _f === void 0 ? void 0 : _f.watchlistId) ? "Update Watchlist" : "Create Watchlist",
                onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                    var items, watchlistData;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!(name && pickerProps.selectionConverter.current)) return [3 /*break*/, 7];
                                items = pickerProps.selectionConverter.current(pickerProps.selectedItems);
                                if (!(items.length < 2)) return [3 /*break*/, 1];
                                toast.show("Please select at least 2 securities");
                                return [3 /*break*/, 6];
                            case 1:
                                watchlistData = {
                                    items: items.map(function (i) { return ({
                                        symbol: i.symbol
                                    }); }),
                                    name: name,
                                    note: note,
                                    type: type
                                };
                                if (!(((_b = (_a = props.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.watchlistId) && props.route.params.watchlistId > 0)) return [3 /*break*/, 3];
                                return [4 /*yield*/, api_1.Api.Watchlist.update(props.route.params.watchlistId, watchlistData)];
                            case 2:
                                _c.sent();
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, api_1.Api.Watchlist.insert(watchlistData)];
                            case 4:
                                _c.sent();
                                _c.label = 5;
                            case 5:
                                props.navigation.goBack();
                                _c.label = 6;
                            case 6: return [3 /*break*/, 8];
                            case 7:
                                toast.show("Please name your watchlist");
                                _c.label = 8;
                            case 8: return [2 /*return*/];
                        }
                    });
                }); }
            }
        }}>
            <Section_1.ElevatedSection style={{ height: "100%" }} title={type === "primary" ? "Quick Watchlist" : "Watchlist Securities"}>
                <WatchlistPicker_1.WatchlistPicker {...pickerProps} securitiesLoaded={function () {
            console.log("Securities are available...");
            setMagic(function (m) { return !m; });
        }}/>
            </Section_1.ElevatedSection>
        </ScrollWithButtons_1.ScrollWithButtons>

    </react_native_1.View>;
};
exports.WatchlistEditorScreen = WatchlistEditorScreen;
