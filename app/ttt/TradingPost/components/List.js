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
exports.List = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var misc_1 = require("../utils/misc");
var Link_1 = require("./Link");
var NoDataPanel_1 = require("./NoDataPanel");
function List(props) {
    var _this = this;
    var _a = (0, react_1.useState)(), internalData = _a[0], setInternalData = _a[1], data = props.data, preloadOffset = props.preloadOffset, datasetKey = props.datasetKey, _b = (0, react_1.useState)(0), currentPage = _b[0], setCurrentPage = _b[1], _c = (0, react_1.useState)(false), pagesDone = _c[0], setPagesDone = _c[1], isLoadingRef = (0, react_1.useRef)(true), _d = (0, react_1.useState)(-1), maxItem = _d[0], setMaxItem = _d[1], _e = (0, react_1.useState)(false), triggertHack = _e[0], setTriggerHack = _e[1], sizeCache = (0, react_1.useRef)([]).current;
    (0, react_1.useEffect)(function () {
        setPagesDone(false);
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof data == "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, data(undefined, 0, sizeCache)];
                    case 1:
                        result = _a.sent();
                        if (!result.length || props.maxPage === 0) {
                            setPagesDone(true);
                        }
                        isLoadingRef.current = false;
                        setInternalData(result);
                        return [3 /*break*/, 3];
                    case 2:
                        isLoadingRef.current = false;
                        setInternalData(data);
                        setPagesDone(true);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, [datasetKey, Boolean(data), props.maxPage]);
    (0, react_1.useEffect)(function () {
        if (!pagesDone && typeof data === 'function' && internalData) {
            if (!isLoadingRef.current) {
                var remaining = (internalData.length - 1) - maxItem;
                if (remaining <= (preloadOffset || 1)) {
                    isLoadingRef.current = true;
                    setTriggerHack(function (hack) { return !hack; });
                    var nextPage_1 = currentPage + 1;
                    var originalLength_1 = internalData.length;
                    data(internalData, nextPage_1, sizeCache).then(function (newData) {
                        if (newData.length === originalLength_1 || props.maxPage === nextPage_1) {
                            isLoadingRef.current = false;
                            setPagesDone(true);
                        }
                        else {
                            setInternalData(newData);
                            setCurrentPage(nextPage_1);
                            isLoadingRef.current = false;
                        }
                    });
                }
                else {
                    //console.log("NOPE");
                }
            }
            else {
                //console.log("WHAT UP");
            }
        }
    }, [maxItem, internalData, preloadOffset, currentPage, props.maxPage]);
    var vp = (0, react_1.useMemo)(function () { return [
        {
            viewabilityConfig: {
                itemVisiblePercentThreshold: 20
            },
            onViewableItemsChanged: function (ev) {
                var max = 0;
                ev.viewableItems.forEach(function (vi) {
                    max = Math.max(max, vi.index || 0);
                });
                setMaxItem(function (curMax) {
                    return Math.max(max, curMax);
                });
            }
        },
    ]; }, []);
    var needsSplice = internalData && props.maxDisaplyCount && internalData.length > props.maxDisaplyCount;
    return !(internalData === null || internalData === void 0 ? void 0 : internalData.length) ? <NoDataPanel_1.NoDataPanel message={internalData ? props.noDataMessage : (props.loadingMessage || "Loading...")}/> :
        <react_native_1.FlatList style={[{
                //    height: "100%" 
                }, props.style]} 
        // contentContainerStyle={[{ height: "100%" }, props.contentContainerStyle]}
        getItemLayout={props.getItemLayout ? function (a, b) { return props.getItemLayout(a, b, sizeCache); } : undefined} numColumns={props.numColumns} ListHeaderComponent={props.ListHeaderComponent} ListFooterComponent={needsSplice ? function () {
                return <Link_1.Link onPress={misc_1.TBI} style={{ marginLeft: "auto" }}>{props.maxDisaplyText || "View All"}</Link_1.Link>;
            } : undefined} stickyHeaderIndices={props.ListHeaderComponent ? [0] : undefined} data={(isLoadingRef.current ? __spreadArray(__spreadArray([], internalData, true), [props.loadingItem], false) : (needsSplice ? internalData.slice(0, props.maxDisaplyCount) : internalData))} keyExtractor={props.keyExtractor} renderItem={props.renderItem} nestedScrollEnabled={props.nestedScrollEnabled} viewabilityConfigCallbackPairs={vp}/>;
    // return <ScrollView nestedScrollEnabled>
    //     <View
    //         style={{ backgroundColor: "purple", height: 1000, borderColor: "yellow", borderWidth: 2 }}
    //     ></View>
    // </ScrollView>
}
exports.List = List;
