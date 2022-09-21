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
exports.FeedPart = exports.FeedScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_2 = require("react-native");
var PlusContentButton_1 = require("../components/PlusContentButton");
var PostList_1 = require("../components/PostList");
var PostView_1 = require("../components/PostView");
var FeedScreen = function (props) {
    var _a = (0, react_1.useState)(""), searchText = _a[0], setSearchText = _a[1];
    //useEffect(()=>{
    //props.navigation.setOptions({
    //headerRight:
    //  })
    // return <Pressable onPress={() => {
    //     navigation.setParams({
    //       bookmarkedOnly: true
    //     })
    //   }}>
    //     <IconButton iconSource={BookmarkIcons.inactive} style={{ height: 24, width: 24 }} />
    //   </Pressable>
    //},[])
    return (<react_native_2.View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <exports.FeedPart bookmarkedOnly={props.route.params.bookmarkedOnly === "true"} searchText={searchText}/>
            <PlusContentButton_1.PlusContentButton onPress={function () {
            props.navigation.navigate("PostEditor");
        }}/>
        </react_native_2.View>);
};
exports.FeedScreen = FeedScreen;
var FeedPart = function (props) {
    var windowWidth = (0, react_native_1.useWindowDimensions)().width;
    var searchText = props.searchText, bookmarkedOnly = props.bookmarkedOnly, userId = props.userId;
    return <PostList_1.PostList key={bookmarkedOnly ? String(Date.now()) : "STATIC"} datasetKey={searchText ? searchText : "____________"} posts={function (allItems, page, sizeCache) { return __awaiter(void 0, void 0, void 0, function () {
            var posts, newItems;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1.Api.Post.extensions.feed({
                            page: page,
                            bookmarkedOnly: bookmarkedOnly,
                            userId: userId,
                            data: searchText ? {
                                terms: (function () {
                                    var terms = searchText.split(" ");
                                    if (terms.length === 1)
                                        return terms[0];
                                    else
                                        return terms.map(function (t) { return "(".concat(t, ")"); }).join(" OR ");
                                })()
                            } : undefined
                        })];
                    case 1:
                        posts = (_a.sent());
                        newItems = __spreadArray(__spreadArray([], (allItems || []), true), posts, true);
                        newItems.forEach(function (itm, index) {
                            if (!sizeCache[index]) {
                                sizeCache[index] = {
                                    index: index,
                                    offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                                    length: (0, PostView_1.postInnerHeight)(itm, windowWidth - PostView_1.spaceOnSide)
                                };
                            }
                        });
                        return [2 /*return*/, newItems];
                }
            });
        }); }}/>;
};
exports.FeedPart = FeedPart;
