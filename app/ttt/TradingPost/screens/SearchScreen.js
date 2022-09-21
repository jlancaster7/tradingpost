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
exports.SearchScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ButtonGroup_1 = require("../components/ButtonGroup");
var List_1 = require("../components/List");
var ProfileBar_1 = require("../components/ProfileBar");
var SearchBar_1 = require("../components/SearchBar");
var Section_1 = require("../components/Section");
var style_1 = require("../style");
var FeedScreen_1 = require("./FeedScreen");
var SearchScreen = function (props) {
    var _a = (0, react_1.useState)(""), searchText = _a[0], setSearchText = _a[1], _b = (0, react_1.useState)("posts"), searchType = _b[0], setSearchType = _b[1], _c = (0, react_1.useState)(), people = _c[0], setPeople = _c[1], debounceRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        clearTimeout(debounceRef.current);
        if (searchType === "people") {
            if (searchText.length >= 3) {
                debounceRef.current = setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, ex_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                _a = setPeople;
                                return [4 /*yield*/, api_1.Api.User.extensions.search({
                                        term: searchText
                                    })];
                            case 1:
                                _a.apply(void 0, [_b.sent()]);
                                return [3 /*break*/, 3];
                            case 2:
                                ex_1 = _b.sent();
                                console.error(ex_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }, 500);
            }
            else {
                setPeople(undefined);
            }
        }
    }, [searchText, searchType]);
    return (<react_native_1.View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <SearchBar_1.SearchBar onTextChange={function (v) {
            setSearchText(v);
        }}/>
            <ButtonGroup_1.ButtonGroup style={{ margin: style_1.sizes.rem1, width: "auto" }} unselectedStyle={{
            backgroundColor: "#35A265"
        }} value={searchType} onValueChange={function (value) {
            setSearchType(value);
            setPeople(undefined);
        }} items={[{ label: "Analysts", "value": "people" }, { label: "Posts", value: "posts" }]}/>
            {searchType === "posts" && <FeedScreen_1.FeedPart searchText={searchText}/>}
            {searchType === "people" && <react_native_1.View style={{ marginHorizontal: style_1.sizes.rem1, flex: 1 }}><List_1.List data={people} loadingMessage={"Search For People"} loadingItem={undefined} renderItem={function (item) {
                return <Section_1.ElevatedSection title="">
                            <ProfileBar_1.ProfileBar user={item.item} style={{ marginBottom: -style_1.sizes.rem0_5 }}/>
                        </Section_1.ElevatedSection>;
            }}/></react_native_1.View>}
            {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <EditScreenInfo path="/screens/TabOneScreen.tsx" /> */}
        </react_native_1.View>);
};
exports.SearchScreen = SearchScreen;
